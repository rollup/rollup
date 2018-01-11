import { timeStart, timeEnd } from './utils/flushTime';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import { find } from './utils/array';
import { keys, blank, forOwn } from './utils/object';
import Module from './Module';
import finalisers from './finalisers/index';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { runSequence } from './utils/promise';
import transformBundle from './utils/transformBundle';
import collapseSourcemaps from './utils/collapseSourcemaps';
import callIfFunction from './utils/callIfFunction';
import error from './utils/error';
import {
	dirname,
	isRelative,
	isAbsolute,
	normalize,
	relative,
	resolve
} from './utils/path';
import { OutputOptions } from './rollup/index';
import { RawSourceMap } from 'source-map';
import Graph from './Graph';
import ExternalModule from './ExternalModule';
import ExternalVariable from './ast/variables/ExternalVariable';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import { DynamicImportMechanism } from './ast/nodes/Import';

export default class Bundle {
	graph: Graph;
	orderedModules: Module[];
	externalModules: ExternalModule[];
	entryModule: Module;

	constructor (graph: Graph, orderedModules: Module[]) {
		this.graph = graph;
		this.orderedModules = orderedModules;
		this.externalModules = undefined;
		this.entryModule = undefined;
	}

	bind () {
		this.orderedModules.forEach(module => module.bindImportSpecifiers());
		this.orderedModules.forEach(module => module.bindReferences());
	}

	includeMarked (treeshake: boolean) {
		if (treeshake) {
			let addedNewNodes;
			do {
				addedNewNodes = false;
				this.orderedModules.forEach(module => {
					if (module.includeInBundle()) {
						addedNewNodes = true;
					}
				});
			} while (addedNewNodes);
		} else {
			// Necessary to properly replace namespace imports
			this.orderedModules.forEach(module => module.includeAllInBundle());
		}
	}

	setOutputFacade (entryModule: Module) {
		this.entryModule = entryModule;
	}

	processExternals () {
		// prune unused external imports
		this.externalModules = this.graph.externalModules.filter(module => {
			return module.used || !this.graph.isPureExternalModule(module.id);
		});
	}

	collectAddon (initialAddon: string, addonName: 'banner' | 'footer' | 'intro' | 'outro', sep: string = '\n') {
		return runSequence(
			[{ pluginName: 'rollup', source: initialAddon } as { pluginName: string, source: string | (() => string) }]
				.concat(
				this.graph.plugins.map((plugin, idx) => {
					return {
						pluginName: plugin.name || `Plugin at pos ${idx}`,
						source: plugin[addonName]
					};
				})
				)
				.map(addon => {
					addon.source = callIfFunction(addon.source);
					return addon;
				})
				.filter(addon => {
					return addon.source;
				})
				.map(({ pluginName, source }) => {
					return Promise.resolve(source).catch(err => {
						error({
							code: 'ADDON_ERROR',
							message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}`
						});
					});
				})
		).then(addons => addons.filter(Boolean).join(sep));
	}

	getPathRelativeToEntryDirname (resolvedId: string): string {
		if (isRelative(resolvedId) || isAbsolute(resolvedId)) {
			const entryDirname = dirname(this.entryModule.id);
			const relativeToEntry = normalize(relative(entryDirname, resolvedId));

			return isRelative(relativeToEntry)
				? relativeToEntry
				: `./${relativeToEntry}`;
		}

		return resolvedId;
	}

	deconflict () {
		const used = blank();

		// ensure no conflicts with globals
		keys(this.graph.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName (name: string): string {
			while (used[name]) {
				name += `$${used[name]++}`;
			}

			used[name] = 1;
			return name;
		}

		const toDeshadow: Set<string> = new Set();

		this.externalModules.forEach(module => {
			const safeName = getSafeName(module.name);
			toDeshadow.add(safeName);
			module.name = safeName;

			// ensure we don't shadow named external imports, if
			// we're creating an ES6 bundle
			forOwn(module.declarations, (declaration, name) => {
				const safeName = getSafeName(name);
				toDeshadow.add(safeName);
				(<ExternalVariable>declaration).setSafeName(safeName);
			});
		});

		this.orderedModules.forEach(module => {
			forOwn(module.scope.variables, variable => {
				if (!(<ExportDefaultVariable>variable).isDefault || !(<ExportDefaultVariable>variable).hasId) {
					variable.name = getSafeName(variable.name);
				}
			});

			// deconflict reified namespaces
			const namespace = module.namespace();
			if (namespace.needsNamespaceBlock) {
				namespace.name = getSafeName(namespace.name);
			}
		});

		this.graph.scope.deshadow(toDeshadow);
	}

	private setIdentifierRenderResolutions (options: OutputOptions) {
		let dynamicImportMechanism: DynamicImportMechanism;

		if (options.format !== 'es') {
			if (options.format === 'cjs') {
				dynamicImportMechanism = {
					left: 'Promise.resolve(require(',
					right: '))'
				};
			} else if (options.format === 'amd') {
				dynamicImportMechanism = {
					left: 'new Promise(function (resolve, reject) { require([',
					right: '], resolve, reject) })'
				}
			}
		}

		this.orderedModules.forEach(module => {
			if (this.graph.dynamicImport) {
				module.dynamicImportResolutions.forEach((replacement, index) => {
					const node = module.dynamicImports[index];

					if (!replacement)
						return;

					if (replacement instanceof Module) {
						node.setResolution(replacement.namespace(), { left: 'Promise.resolve().then(() => ', right: ')' });
					// external dynamic import resolution
					} else if (replacement instanceof ExternalModule) {
						node.setResolution(`"${replacement.id}"`, dynamicImportMechanism);
					// AST Node -> source replacement
					} else {
						node.setResolution(replacement, dynamicImportMechanism);
					}
				});
			}
		});
	}

	render (options: OutputOptions) {
		return Promise.resolve()
			.then(() => {
				return Promise.all([
					this.collectAddon(options.banner, 'banner'),
					this.collectAddon(options.footer, 'footer'),
					this.collectAddon(options.intro, 'intro', '\n\n'),
					this.collectAddon(options.outro, 'outro', '\n\n')
				]);
			})
			.then(([banner, footer, intro, outro]) => {
				// Determine export mode - 'default', 'named', 'none'
				const exportMode = getExportMode(this, options);

				let magicString = new MagicStringBundle({ separator: '\n\n' });
				const usedModules: Module[] = [];

				timeStart('render modules');

				this.setIdentifierRenderResolutions(options);

				this.orderedModules.forEach(module => {
					const source = module.render(
						options.format === 'es',
						this.graph.legacy,
						options.freeze !== false
					);

					if (source.toString().length) {
						magicString.addSource(source);
						usedModules.push(module);
					}
				});

				if (
					!magicString.toString().trim() &&
					this.entryModule.getExports().length === 0 &&
					this.entryModule.getReexports().length === 0
				) {
					this.graph.warn({
						code: 'EMPTY_BUNDLE',
						message: 'Generated an empty bundle'
					});
				}

				timeEnd('render modules');

				const indentString = getIndentString(magicString, options);

				const finalise = finalisers[options.format];
				if (!finalise) {
					error({
						code: 'INVALID_OPTION',
						message: `Invalid format: ${
							options.format
							} - valid options are ${keys(finalisers).join(', ')}`
					});
				}

				timeStart('render format');

				const optionsPaths = options.paths;
				const getPath =
					typeof optionsPaths === 'function'
						? (id: string) => optionsPaths(id) || this.getPathRelativeToEntryDirname(id)
						: optionsPaths
							? (id: string) =>
								optionsPaths.hasOwnProperty(id)
									? optionsPaths[id]
									: this.getPathRelativeToEntryDirname(id)
							: (id: string) => this.getPathRelativeToEntryDirname(id);

				if (intro) intro += '\n\n';
				if (outro) outro = `\n\n${outro}`;

				magicString = finalise(
					this,
					(<any>magicString).trim(), // TODO TypeScript: Awaiting MagicString PR
					{ exportMode, getPath, indentString, intro, outro },
					options
				);

				timeEnd('render format');

				if (banner) magicString.prepend(banner + '\n');
				if (footer) (<any>magicString).append('\n' + footer); // TODO TypeScript: Awaiting MagicString PR

				const prevCode = magicString.toString();
				let map: RawSourceMap = null;
				const bundleSourcemapChain: RawSourceMap[] = [];

				return transformBundle(
					prevCode,
					this.graph.plugins,
					bundleSourcemapChain,
					options
				).then((code: string) => {
					if (options.sourcemap) {
						timeStart('sourcemap');

						let file = options.sourcemapFile || options.file;
						if (file)
							file = resolve(
								typeof process !== 'undefined' ? process.cwd() : '',
								file
							);

						if (
							this.graph.hasLoaders ||
							find(
								this.graph.plugins,
								plugin => Boolean(plugin.transform || plugin.transformBundle)
							)
						) {
							map = <any>magicString.generateMap({}); // TODO TypeScript: Awaiting missing version in SourceMap type
							if (typeof map.mappings === 'string') {
								map.mappings = decode(map.mappings);
							}
							map = collapseSourcemaps(
								this,
								file,
								map,
								usedModules,
								bundleSourcemapChain
							);
						} else {
							map = <any>magicString.generateMap({ file, includeContent: true }); // TODO TypeScript: Awaiting missing version in SourceMap type
						}

						map.sources = map.sources.map(normalize);

						timeEnd('sourcemap');
					}

					if (code[code.length - 1] !== '\n') code += '\n';
					return { code, map } as { code: string, map: any }; // TODO TypeScript: Awaiting missing version in SourceMap type
				});
			});
	}
}
