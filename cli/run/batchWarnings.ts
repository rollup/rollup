import color from 'colorette';
import { RollupWarning } from '../../src/rollup/types';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';

export interface BatchWarnings {
	add: (warning: RollupWarning) => void;
	readonly count: number;
	flush: () => void;
}

export default function batchWarnings() {
	let deferredWarnings = new Map<keyof typeof deferredHandlers, RollupWarning[]>();
	let count = 0;

	return {
		get count() {
			return count;
		},

		add: (warning: RollupWarning) => {
			count += 1;

			if (warning.code! in deferredHandlers) {
				if (!deferredWarnings.has(warning.code!)) deferredWarnings.set(warning.code!, []);
				deferredWarnings.get(warning.code!)!.push(warning);
			} else if (warning.code! in immediateHandlers) {
				immediateHandlers[warning.code!](warning);
			} else {
				title(warning.message);

				if (warning.url) info(warning.url);

				const id = (warning.loc && warning.loc.file) || warning.id;
				if (id) {
					const loc = warning.loc
						? `${relativeId(id)}: (${warning.loc.line}:${warning.loc.column})`
						: relativeId(id);

					stderr(color.bold(relativeId(loc)));
				}

				if (warning.frame) info(warning.frame);
			}
		},

		flush: () => {
			if (count === 0) return;

			const codes = Array.from(deferredWarnings.keys()).sort(
				(a, b) => deferredWarnings.get(b)!.length - deferredWarnings.get(a)!.length
			);

			for (const code of codes) {
				deferredHandlers[code](deferredWarnings.get(code)!);
			}

			deferredWarnings = new Map();
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
			warning.modules!.length === 1
				? `'${warning.modules![0]}'`
				: `${warning
						.modules!.slice(0, -1)
						.map((name: string) => `'${name}'`)
						.join(', ')} and '${warning.modules!.slice(-1)}'`;
		stderr(
			`Creating a browser bundle that depends on ${detail}. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
		);
	}
};

const deferredHandlers: {
	[code: string]: (warnings: RollupWarning[]) => void;
} = {
	CIRCULAR_DEPENDENCY(warnings) {
		title(`Circular dependenc${warnings.length > 1 ? 'ies' : 'y'}`);
		const displayed = warnings.length > 5 ? warnings.slice(0, 3) : warnings;
		for (const warning of displayed) {
			stderr(warning.cycle!.join(' -> '));
		}
		if (warnings.length > displayed.length) {
			stderr(`...and ${warnings.length - displayed.length} more`);
		}
	},

	EMPTY_BUNDLE(warnings) {
		title(
			`Generated${warnings.length === 1 ? ' an' : ''} empty ${
				warnings.length > 1 ? 'chunks' : 'chunk'
			}`
		);
		stderr(warnings.map(warning => warning.chunkName!).join(', '));
	},

	EVAL(warnings) {
		title('Use of eval is strongly discouraged');
		info('https://rollupjs.org/guide/en/#avoiding-eval');
		showTruncatedWarnings(warnings);
	},

	MISSING_EXPORT(warnings) {
		title('Missing exports');
		info('https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module');

		for (const warning of warnings) {
			stderr(color.bold(warning.importer!));
			stderr(`${warning.missing} is not exported by ${warning.exporter}`);
			stderr(color.gray(warning.frame!));
		}
	},

	MISSING_GLOBAL_NAME(warnings) {
		title(`Missing global variable ${warnings.length > 1 ? 'names' : 'name'}`);
		stderr(
			`Use output.globals to specify browser global variable names corresponding to external modules`
		);
		for (const warning of warnings) {
			stderr(`${color.bold(warning.source!)} (guessing '${warning.guess}')`);
		}
	},

	MIXED_EXPORTS: (warnings) => {
		title('Mixing named and default exports');
		info(`https://rollupjs.org/guide/en/#output-exports`);
		stderr(
			color.bold('The following entry modules are using named and default exports together:')
		);
		const displayedWarnings = warnings.length > 5 ? warnings.slice(0, 3) : warnings;
		for (const warning of displayedWarnings) {
			stderr(relativeId(warning.id!));
		}
		if (displayedWarnings.length < warnings.length) {
			stderr(`...and ${warnings.length - displayedWarnings.length} other entry modules`);
		}
		stderr(
			`\nConsumers of your bundle will have to use chunk['default'] to access their default export, which may not be what you want. Use \`output.exports: 'named'\` to disable this warning`
		);
	},

	NAMESPACE_CONFLICT(warnings) {
		title(`Conflicting re-exports`);
		for (const warning of warnings) {
			stderr(
				`${color.bold(relativeId(warning.reexporter!))} re-exports '${
					warning.name
				}' from both ${relativeId(warning.sources![0])} and ${relativeId(
					warning.sources![1]
				)} (will be ignored)`
			);
		}
	},

	NON_EXISTENT_EXPORT(warnings) {
		title(`Import of non-existent ${warnings.length > 1 ? 'exports' : 'export'}`);
		showTruncatedWarnings(warnings);
	},

	PLUGIN_WARNING(warnings) {
		const nestedByPlugin = nest(warnings, 'plugin');

		for (const { key: plugin, items } of nestedByPlugin) {
			const nestedByMessage = nest(items, 'message');

			let lastUrl = '';

			for (const { key: message, items } of nestedByMessage) {
				title(`Plugin ${plugin}: ${message}`);
				for (const warning of items) {
					if (warning.url && warning.url !== lastUrl) info((lastUrl = warning.url));

					if (warning.id) {
						let loc = relativeId(warning.id);
						if (warning.loc) {
							loc += `: (${warning.loc.line}:${warning.loc.column})`;
						}
						stderr(color.bold(loc));
					}
					if (warning.frame) info(warning.frame);
				}
			}
		}
	},

	SOURCEMAP_BROKEN(warnings) {
		title(`Broken sourcemap`);
		info('https://rollupjs.org/guide/en/#warning-sourcemap-is-likely-to-be-incorrect');

		const plugins = Array.from(new Set(warnings.map(w => w.plugin).filter(Boolean)));
		const detail =
			plugins.length > 1
				? ` (such as ${plugins
				.slice(0, -1)
				.map(p => `'${p}'`)
				.join(', ')} and '${plugins.slice(-1)}')`
				: ` (such as '${plugins[0]}')`;

		stderr(`Plugins that transform code${detail} should generate accompanying sourcemaps`);
	},

	THIS_IS_UNDEFINED(warnings) {
		title('`this` has been rewritten to `undefined`');
		info('https://rollupjs.org/guide/en/#error-this-is-undefined');
		showTruncatedWarnings(warnings);
	},

	UNRESOLVED_IMPORT(warnings) {
		title('Unresolved dependencies');
		info('https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency');

		const dependencies = new Map();
		for (const warning of warnings) {
			if (!dependencies.has(warning.source)) dependencies.set(warning.source, []);
			dependencies.get(warning.source).push(warning.importer);
		}

		for (const dependency of dependencies.keys()) {
			const importers = dependencies.get(dependency);
			stderr(`${color.bold(dependency)} (imported by ${importers.join(', ')})`);
		}
	},

	UNUSED_EXTERNAL_IMPORT(warnings) {
		title('Unused external imports');
		for (const warning of warnings) {
			stderr(`${warning.names} imported from external module '${warning.source}' but never used`);
		}
	}
};

function title(str: string) {
	stderr(color.bold(color.yellow(`(!) ${str}`)));
}

function info(url: string) {
	stderr(color.gray(url));
}

function nest<T>(array: T[], prop: string) {
	const nested: { items: T[]; key: string }[] = [];
	const lookup = new Map<string, { items: T[]; key: string }>();

	for (const item of array) {
		const key = (item as any)[prop];
		if (!lookup.has(key)) {
			lookup.set(key, {
				items: [],
				key
			});

			nested.push(lookup.get(key)!);
		}

		lookup.get(key)!.items.push(item);
	}

	return nested;
}

function showTruncatedWarnings(warnings: RollupWarning[]) {
	const nestedByModule = nest(warnings, 'id');

	const displayedByModule = nestedByModule.length > 5 ? nestedByModule.slice(0, 3) : nestedByModule;
	for (const { key: id, items } of displayedByModule) {
		stderr(color.bold(relativeId(id)));
		stderr(color.gray(items[0].frame!));

		if (items.length > 1) {
			stderr(`...and ${items.length - 1} other ${items.length > 2 ? 'occurrences' : 'occurrence'}`);
		}
	}

	if (nestedByModule.length > displayedByModule.length) {
		stderr(`\n...and ${nestedByModule.length - displayedByModule.length} other files`);
	}
}
