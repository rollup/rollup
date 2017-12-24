import { timeStart, timeEnd } from './utils/flushTime';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import { find } from './utils/array';
import { blank, forOwn, keys } from './utils/object';
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
import ExternalVariable from './ast/variables/ExternalVariable';
import { RawSourceMap } from 'source-map';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import Graph from './Graph';
import GlobalScope from './ast/scopes/GlobalScope';
import ExternalModule from './ExternalModule';

export default class Bundle {
	graph: Graph;
	modules: Module[];
	externalModules: ExternalModule[];
	orderedModules: Module[];
	entryModule: Module;
	scope: GlobalScope;

	constructor (graph: Graph, modules: Module[], entryModule: Module) {
		this.graph = graph;
		this.modules = modules;
		this.externalModules = undefined;
		this.orderedModules = undefined;
		this.entryModule = entryModule;
		this.scope = graph.scope;
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

	deconflict () {
		const used = blank();

		// ensure no conflicts with globals
		keys(this.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName (name: string): string {
			while (used[name]) {
				name += `$${used[name]++}`;
			}

			used[name] = 1;
			return name;
		}

		const toDeshadow: Set<string> = new Set();

		this.graph.externalModules.forEach(module => {
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

		this.modules.forEach(module => {
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

		this.scope.deshadow(toDeshadow);
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

	sortOrderedModules (externalModules: ExternalModule[]) {
		this.externalModules = externalModules;

		let hasCycles;
		const seen: { [id: string]: boolean } = {};
		const ordered: Module[] = [];

		const stronglyDependsOn = blank();
		const dependsOn = blank();

		this.modules.forEach(module => {
			stronglyDependsOn[module.id] = blank();
			dependsOn[module.id] = blank();
		});

		this.modules.forEach(module => {
			function processStrongDependency (dependency: Module) {
				if (
					dependency === module ||
					stronglyDependsOn[module.id][dependency.id]
				)
					return;

				stronglyDependsOn[module.id][dependency.id] = true;
				dependency.strongDependencies.forEach(processStrongDependency);
			}

			function processDependency (dependency: Module) {
				if (dependency === module || dependsOn[module.id][dependency.id])
					return;

				dependsOn[module.id][dependency.id] = true;
				dependency.dependencies.forEach(processDependency);
			}

			module.strongDependencies.forEach(processStrongDependency);
			module.dependencies.forEach(processDependency);
		});

		const visit = (module: Module) => {
			if (seen[module.id]) {
				hasCycles = true;
				return;
			}

			seen[module.id] = true;

			module.dependencies.forEach(visit);
			ordered.push(module);
		};

		visit(this.entryModule);

		if (hasCycles) {
			ordered.forEach((a, i) => {
				for (i += 1; i < ordered.length; i += 1) {
					const b = ordered[i];

					// TODO reinstate this! it no longer works
					if (stronglyDependsOn[a.id][b.id]) {
						// somewhere, there is a module that imports b before a. Because
						// b imports a, a is placed before b. We need to find the module
						// in question, so we can provide a useful error message
						let parent = '[[unknown]]';
						const visited: { [id: string]: boolean } = {};

						const findParent = (module: Module) => {
							if (dependsOn[module.id][a.id] && dependsOn[module.id][b.id]) {
								parent = module.id;
								return true;
							}
							visited[module.id] = true;
							for (let i = 0; i < module.dependencies.length; i += 1) {
								const dependency = module.dependencies[i];
								if (!visited[dependency.id] && findParent(<Module>dependency))
									return true;
							}
						};

						findParent(this.entryModule);

						this.graph.onwarn(
							<any>`Module ${a.id} may be unable to evaluate without ${
							b.id
							}, but is included first due to a cyclical dependency. Consider swapping the import statements in ${parent} to ensure correct ordering`
						);
					}
				}
			});
		}

		this.orderedModules = ordered;
	}
}
