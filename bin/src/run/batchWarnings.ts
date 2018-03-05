import chalk from 'chalk';
import { stderr } from '../logging';
import relativeId from '../../../src/utils/relativeId';
import { RollupWarning } from '../../../src/rollup/index';

export interface BatchWarnings {
	readonly count: number;
	add: (warning: string | RollupWarning) => void;
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
						stderr(`${chalk.bold.yellow('(!)')} ${chalk.bold.yellow(warning.message)}`);

						if (warning.url) info(warning.url);

						const id = (warning.loc && warning.loc.file) || warning.id;
						if (id) {
							const loc = warning.loc
								? `${relativeId(id)}: (${warning.loc.line}:${warning.loc.column})`
								: relativeId(id);

							stderr(chalk.bold(relativeId(loc)));
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

	DEPRECATED_OPTIONS: warning => {
		title(`Some options have been renamed`);
		info(`https://gist.github.com/Rich-Harris/d472c50732dab03efeb37472b08a3f32`);
		warning.deprecations.forEach(option => {
			stderr(`${chalk.bold(option.old)} is now ${option.new}`);
		});
	},

	MISSING_NODE_BUILTINS: warning => {
		title(`Missing shims for Node.js built-ins`);

		const detail =
			warning.modules.length === 1
				? `'${warning.modules[0]}'`
				: `${warning.modules
						.slice(0, -1)
						.map(name => `'${name}'`)
						.join(', ')} and '${warning.modules.slice(-1)}'`;
		stderr(
			`Creating a browser bundle that depends on ${detail}. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
		);
	},

	MIXED_EXPORTS: () => {
		title('Mixing named and default exports');
		stderr(
			`Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use \`exports: 'named'\` to disable this warning`
		);
	},

	EMPTY_BUNDLE: () => {
		title(`Generated an empty bundle`);
	}
};

// TODO select sensible priorities
const deferredHandlers: {
	[code: string]: {
		priority: number;
		fn: (warnings: RollupWarning[]) => void;
	};
} = {
	UNUSED_EXTERNAL_IMPORT: {
		priority: 1,
		fn: warnings => {
			title('Unused external imports');
			warnings.forEach(warning => {
				stderr(`${warning.names} imported from external module '${warning.source}' but never used`);
			});
		}
	},

	UNRESOLVED_IMPORT: {
		priority: 1,
		fn: warnings => {
			title('Unresolved dependencies');
			info('https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency');

			const dependencies = new Map();
			warnings.forEach(warning => {
				if (!dependencies.has(warning.source)) dependencies.set(warning.source, []);
				dependencies.get(warning.source).push(warning.importer);
			});

			Array.from(dependencies.keys()).forEach(dependency => {
				const importers = dependencies.get(dependency);
				stderr(`${chalk.bold(dependency)} (imported by ${importers.join(', ')})`);
			});
		}
	},

	MISSING_EXPORT: {
		priority: 1,
		fn: warnings => {
			title('Missing exports');
			info('https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module');

			warnings.forEach(warning => {
				stderr(chalk.bold(warning.importer));
				stderr(`${warning.missing} is not exported by ${warning.exporter}`);
				stderr(chalk.grey(warning.frame));
			});
		}
	},

	THIS_IS_UNDEFINED: {
		priority: 1,
		fn: warnings => {
			title('`this` has been rewritten to `undefined`');
			info('https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined');
			showTruncatedWarnings(warnings);
		}
	},

	EVAL: {
		priority: 1,
		fn: warnings => {
			title('Use of eval is strongly discouraged');
			info('https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval');
			showTruncatedWarnings(warnings);
		}
	},

	NON_EXISTENT_EXPORT: {
		priority: 1,
		fn: warnings => {
			title(`Import of non-existent ${warnings.length > 1 ? 'exports' : 'export'}`);
			showTruncatedWarnings(warnings);
		}
	},

	NAMESPACE_CONFLICT: {
		priority: 1,
		fn: warnings => {
			title(`Conflicting re-exports`);
			warnings.forEach(warning => {
				stderr(
					`${chalk.bold(relativeId(warning.reexporter))} re-exports '${warning.name}' from both ${relativeId(
						warning.sources[0]
					)} and ${relativeId(warning.sources[1])} (will be ignored)`
				);
			});
		}
	},

	MISSING_GLOBAL_NAME: {
		priority: 1,
		fn: warnings => {
			title(`Missing global variable ${warnings.length > 1 ? 'names' : 'name'}`);
			stderr(`Use output.globals to specify browser global variable names corresponding to external modules`);
			warnings.forEach(warning => {
				stderr(`${chalk.bold(warning.source)} (guessing '${warning.guess}')`);
			});
		}
	},

	SOURCEMAP_BROKEN: {
		priority: 1,
		fn: warnings => {
			title(`Broken sourcemap`);
			info('https://github.com/rollup/rollup/wiki/Troubleshooting#sourcemap-is-likely-to-be-incorrect');

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
		}
	},

	PLUGIN_WARNING: {
		priority: 1,
		fn: warnings => {
			const nestedByPlugin = nest(warnings, 'plugin');

			nestedByPlugin.forEach(({ key: plugin, items }) => {
				const nestedByMessage = nest(items, 'message');

				let lastUrl: string;

				nestedByMessage.forEach(({ key: message, items }) => {
					title(`${plugin} plugin: ${message}`);
					items.forEach(warning => {
						if (warning.url !== lastUrl) info((lastUrl = warning.url));

						const loc = warning.loc
							? `${relativeId(warning.id)}: (${warning.loc.line}:${warning.loc.column})`
							: relativeId(warning.id);

						stderr(chalk.bold(relativeId(loc)));
						if (warning.frame) info(warning.frame);
					});
				});
			});
		}
	}
};

function title(str: string) {
	stderr(`${chalk.bold.yellow('(!)')} ${chalk.bold.yellow(str)}`);
}

function info(url: string) {
	stderr(chalk.grey(url));
}

function nest<T>(array: T[], prop: string) {
	const nested: { key: string; items: T[] }[] = [];
	const lookup = new Map<string, { key: string; items: T[] }>();

	array.forEach(item => {
		const key = (<any>item)[prop];
		if (!lookup.has(key)) {
			lookup.set(key, {
				key,
				items: []
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
		stderr(chalk.bold(relativeId(id)));
		stderr(chalk.grey(items[0].frame));

		if (items.length > 1) {
			stderr(`...and ${items.length - 1} other ${items.length > 2 ? 'occurrences' : 'occurrence'}`);
		}
	});

	if (nestedByModule.length > sliced.length) {
		stderr(`\n...and ${nestedByModule.length - sliced.length} other files`);
	}
}
