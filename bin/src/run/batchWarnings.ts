import tc from 'turbocolor';
import { RollupWarning } from '../../../src/rollup/types';
import relativeId from '../../../src/utils/relativeId';
import { stderr } from '../logging';

export interface BatchWarnings {
	add: (warning: string | RollupWarning) => void;
	readonly count: number;
	flush: () => void;
}

export default function batchWarnings() {
	let allWarnings = new Map<string, RollupWarning[]>();
	let count = 0;

	return {
		get count() {
			return count;
		},

		add: (warning: string | RollupWarning) => {
			if (typeof warning === 'string') {
				warning = { code: 'UNKNOWN', message: warning };
			}

			if (warning.code in immediateHandlers) {
				immediateHandlers[warning.code](warning);
				return;
			}

			if (!allWarnings.has(warning.code)) allWarnings.set(warning.code, []);
			allWarnings.get(warning.code).push(warning);

			count += 1;
		},

		flush: () => {
			if (count === 0) return;

			const codes = Array.from(allWarnings.keys()).sort((a, b) => {
				if (deferredHandlers[a] && deferredHandlers[b]) {
					return deferredHandlers[a].priority - deferredHandlers[b].priority;
				}

				if (deferredHandlers[a]) return -1;
				if (deferredHandlers[b]) return 1;
				return allWarnings.get(b).length - allWarnings.get(a).length;
			});

			codes.forEach(code => {
				const handler = deferredHandlers[code];
				const warnings = allWarnings.get(code);

				if (handler) {
					handler.fn(warnings);
				} else {
					warnings.forEach(warning => {
						title(warning.message);

						if (warning.url) info(warning.url);

						const id = (warning.loc && warning.loc.file) || warning.id;
						if (id) {
							const loc = warning.loc
								? `${relativeId(id)}: (${warning.loc.line}:${warning.loc.column})`
								: relativeId(id);

							stderr(tc.bold(relativeId(loc)));
						}

						if (warning.frame) info(warning.frame);
					});
				}
			});

			allWarnings = new Map();
			count = 0;
		}
	};
}

const immediateHandlers: {
	[code: string]: (warning: RollupWarning) => void;
} = {
	UNKNOWN_OPTION: warning => {
		title(`You have passed an unrecognized option`);
		stderr(warning.message);
	},

	MISSING_NODE_BUILTINS: warning => {
		title(`Missing shims for Node.js built-ins`);

		const detail =
			warning.modules.length === 1
				? `'${warning.modules[0]}'`
				: `${warning.modules
						.slice(0, -1)
						.map((name: string) => `'${name}'`)
						.join(', ')} and '${warning.modules.slice(-1)}'`;
		stderr(
			`Creating a browser bundle that depends on ${detail}. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
		);
	},

	MIXED_EXPORTS: () => {
		title('Mixing named and default exports');
		stderr(
			`Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use \`output.exports: 'named'\` to disable this warning`
		);
	},

	EMPTY_BUNDLE: () => {
		title(`Generated an empty bundle`);
	}
};

// TODO select sensible priorities
const deferredHandlers: {
	[code: string]: {
		fn: (warnings: RollupWarning[]) => void;
		priority: number;
	};
} = {
	UNUSED_EXTERNAL_IMPORT: {
		fn: warnings => {
			title('Unused external imports');
			warnings.forEach(warning => {
				stderr(`${warning.names} imported from external module '${warning.source}' but never used`);
			});
		},
		priority: 1
	},

	UNRESOLVED_IMPORT: {
		fn: warnings => {
			title('Unresolved dependencies');
			info('https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency');

			const dependencies = new Map();
			warnings.forEach(warning => {
				if (!dependencies.has(warning.source)) dependencies.set(warning.source, []);
				dependencies.get(warning.source).push(warning.importer);
			});

			Array.from(dependencies.keys()).forEach(dependency => {
				const importers = dependencies.get(dependency);
				stderr(`${tc.bold(dependency)} (imported by ${importers.join(', ')})`);
			});
		},
		priority: 1
	},

	MISSING_EXPORT: {
		fn: warnings => {
			title('Missing exports');
			info('https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-');

			warnings.forEach(warning => {
				stderr(tc.bold(warning.importer));
				stderr(`${warning.missing} is not exported by ${warning.exporter}`);
				stderr(tc.gray(warning.frame));
			});
		},
		priority: 1
	},

	THIS_IS_UNDEFINED: {
		fn: warnings => {
			title('`this` has been rewritten to `undefined`');
			info('https://rollupjs.org/guide/en#error-this-is-undefined');
			showTruncatedWarnings(warnings);
		},
		priority: 1
	},

	EVAL: {
		fn: warnings => {
			title('Use of eval is strongly discouraged');
			info('https://rollupjs.org/guide/en#avoiding-eval');
			showTruncatedWarnings(warnings);
		},
		priority: 1
	},

	NON_EXISTENT_EXPORT: {
		fn: warnings => {
			title(`Import of non-existent ${warnings.length > 1 ? 'exports' : 'export'}`);
			showTruncatedWarnings(warnings);
		},
		priority: 1
	},

	NAMESPACE_CONFLICT: {
		fn: warnings => {
			title(`Conflicting re-exports`);
			warnings.forEach(warning => {
				stderr(
					`${tc.bold(relativeId(warning.reexporter))} re-exports '${
						warning.name
					}' from both ${relativeId(warning.sources[0])} and ${relativeId(
						warning.sources[1]
					)} (will be ignored)`
				);
			});
		},
		priority: 1
	},

	MISSING_GLOBAL_NAME: {
		fn: warnings => {
			title(`Missing global variable ${warnings.length > 1 ? 'names' : 'name'}`);
			stderr(
				`Use output.globals to specify browser global variable names corresponding to external modules`
			);
			warnings.forEach(warning => {
				stderr(`${tc.bold(warning.source)} (guessing '${warning.guess}')`);
			});
		},
		priority: 1
	},

	SOURCEMAP_BROKEN: {
		fn: warnings => {
			title(`Broken sourcemap`);
			info('https://rollupjs.org/guide/en#warning-sourcemap-is-likely-to-be-incorrect');

			const plugins = Array.from(new Set(warnings.map(w => w.plugin).filter(Boolean)));
			const detail =
				plugins.length === 0
					? ''
					: plugins.length > 1
					? ` (such as ${plugins
							.slice(0, -1)
							.map(p => `'${p}'`)
							.join(', ')} and '${plugins.slice(-1)}')`
					: ` (such as '${plugins[0]}')`;

			stderr(`Plugins that transform code${detail} should generate accompanying sourcemaps`);
		},
		priority: 1
	},

	PLUGIN_WARNING: {
		fn: warnings => {
			const nestedByPlugin = nest(warnings, 'plugin');

			nestedByPlugin.forEach(({ key: plugin, items }) => {
				const nestedByMessage = nest(items, 'message');

				let lastUrl: string;

				nestedByMessage.forEach(({ key: message, items }) => {
					title(`${plugin} plugin: ${message}`);
					items.forEach(warning => {
						if (warning.url !== lastUrl) info((lastUrl = warning.url));

						if (warning.id) {
							let loc = relativeId(warning.id);
							if (warning.loc) {
								loc += `: (${warning.loc.line}:${warning.loc.column})`;
							}
							stderr(tc.bold(loc));
						}
						if (warning.frame) info(warning.frame);
					});
				});
			});
		},
		priority: 1
	}
};

function title(str: string) {
	stderr(`${tc.bold.yellow('(!)')} ${tc.bold.yellow(str)}`);
}

function info(url: string) {
	stderr(tc.gray(url));
}

function nest<T>(array: T[], prop: string) {
	const nested: { items: T[]; key: string }[] = [];
	const lookup = new Map<string, { items: T[]; key: string }>();

	array.forEach(item => {
		const key = (<any>item)[prop];
		if (!lookup.has(key)) {
			lookup.set(key, {
				items: [],
				key
			});

			nested.push(lookup.get(key));
		}

		lookup.get(key).items.push(item);
	});

	return nested;
}

function showTruncatedWarnings(warnings: RollupWarning[]) {
	const nestedByModule = nest(warnings, 'id');

	const sliced = nestedByModule.length > 5 ? nestedByModule.slice(0, 3) : nestedByModule;
	sliced.forEach(({ key: id, items }) => {
		stderr(tc.bold(relativeId(id)));
		stderr(tc.gray(items[0].frame));

		if (items.length > 1) {
			stderr(`...and ${items.length - 1} other ${items.length > 2 ? 'occurrences' : 'occurrence'}`);
		}
	});

	if (nestedByModule.length > sliced.length) {
		stderr(`\n...and ${nestedByModule.length - sliced.length} other files`);
	}
}
