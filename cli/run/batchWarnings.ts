import { blue, cyan } from 'colorette';
import type { RollupLog } from '../../src/rollup/types';
import { bold, gray, yellow } from '../../src/utils/colors';
import { ensureArray } from '../../src/utils/ensureArray';
import { getLogFilter } from '../../src/utils/getLogFilter';
import { getNewArray, getOrCreate } from '../../src/utils/getOrCreate';
import { LOGLEVEL_DEBUG, LOGLEVEL_WARN } from '../../src/utils/logging';
import { printQuotedStringList } from '../../src/utils/printStringList';
import relativeId from '../../src/utils/relativeId';
import { getRollupUrl } from '../../src/utils/url';
import {
	URL_AVOIDING_EVAL,
	URL_NAME_IS_NOT_EXPORTED,
	URL_OUTPUT_EXPORTS,
	URL_OUTPUT_GLOBALS,
	URL_SOURCEMAP_IS_LIKELY_TO_BE_INCORRECT,
	URL_THIS_IS_UNDEFINED,
	URL_TREATING_MODULE_AS_EXTERNAL_DEPENDENCY
} from '../../src/utils/urls';
import { stderr } from '../logging';
import type { BatchWarnings } from './loadConfigFileType';

export default function batchWarnings(command: Record<string, any>): BatchWarnings {
	const silent = !!command.silent;
	const logFilter = generateLogFilter(command);
	let count = 0;
	const deferredWarnings = new Map<keyof typeof deferredHandlers, RollupLog[]>();
	let warningOccurred = false;

	const add = (warning: RollupLog) => {
		count += 1;
		warningOccurred = true;

		if (silent) return;
		if (warning.code! in deferredHandlers) {
			getOrCreate(deferredWarnings, warning.code!, getNewArray).push(warning);
		} else if (warning.code! in immediateHandlers) {
			immediateHandlers[warning.code!](warning);
		} else {
			title(warning.message);
			defaultBody(warning);
		}
	};

	return {
		add,

		get count() {
			return count;
		},

		flush() {
			if (count === 0 || silent) return;

			const codes = [...deferredWarnings.keys()].sort(
				(a, b) => deferredWarnings.get(b)!.length - deferredWarnings.get(a)!.length
			);

			for (const code of codes) {
				deferredHandlers[code](deferredWarnings.get(code)!);
			}

			deferredWarnings.clear();
			count = 0;
		},

		log(level, log) {
			if (!logFilter(log)) return;
			switch (level) {
				case LOGLEVEL_WARN: {
					return add(log);
				}
				case LOGLEVEL_DEBUG: {
					if (!silent) {
						stderr(bold(blue(log.message)));
						defaultBody(log);
					}
					return;
				}
				default: {
					if (!silent) {
						stderr(bold(cyan(log.message)));
						defaultBody(log);
					}
				}
			}
		},

		get warningOccurred() {
			return warningOccurred;
		}
	};
}

const immediateHandlers: {
	[code: string]: (warning: RollupLog) => void;
} = {
	MISSING_NODE_BUILTINS(warning) {
		title(`Missing shims for Node.js built-ins`);

		stderr(
			`Creating a browser bundle that depends on ${printQuotedStringList(
				warning.ids!
			)}. You might need to include https://github.com/FredKSchott/rollup-plugin-polyfill-node`
		);
	},

	UNKNOWN_OPTION(warning) {
		title(`You have passed an unrecognized option`);
		stderr(warning.message);
	}
};

const deferredHandlers: {
	[code: string]: (warnings: RollupLog[]) => void;
} = {
	CIRCULAR_DEPENDENCY(warnings) {
		title(`Circular dependenc${warnings.length > 1 ? 'ies' : 'y'}`);
		const displayed = warnings.length > 5 ? warnings.slice(0, 3) : warnings;
		for (const warning of displayed) {
			stderr(warning.ids!.map(relativeId).join(' -> '));
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
		stderr(printQuotedStringList(warnings.map(warning => warning.names![0])));
	},

	EVAL(warnings) {
		title('Use of eval is strongly discouraged');
		info(getRollupUrl(URL_AVOIDING_EVAL));
		showTruncatedWarnings(warnings);
	},

	MISSING_EXPORT(warnings) {
		title('Missing exports');
		info(getRollupUrl(URL_NAME_IS_NOT_EXPORTED));

		for (const warning of warnings) {
			stderr(bold(relativeId(warning.id!)));
			stderr(`${warning.binding} is not exported by ${relativeId(warning.exporter!)}`);
			stderr(gray(warning.frame!));
		}
	},

	MISSING_GLOBAL_NAME(warnings) {
		title(`Missing global variable ${warnings.length > 1 ? 'names' : 'name'}`);
		info(getRollupUrl(URL_OUTPUT_GLOBALS));
		stderr(
			`Use "output.globals" to specify browser global variable names corresponding to external modules:`
		);
		for (const warning of warnings) {
			stderr(`${bold(warning.id!)} (guessing "${warning.names![0]}")`);
		}
	},

	MIXED_EXPORTS(warnings) {
		title('Mixing named and default exports');
		info(getRollupUrl(URL_OUTPUT_EXPORTS));
		stderr(bold('The following entry modules are using named and default exports together:'));
		warnings.sort((a, b) => (a.id! < b.id! ? -1 : 1));
		const displayedWarnings = warnings.length > 5 ? warnings.slice(0, 3) : warnings;
		for (const warning of displayedWarnings) {
			stderr(relativeId(warning.id!));
		}
		if (displayedWarnings.length < warnings.length) {
			stderr(`...and ${warnings.length - displayedWarnings.length} other entry modules`);
		}
		stderr(
			`\nConsumers of your bundle will have to use chunk.default to access their default export, which may not be what you want. Use \`output.exports: "named"\` to disable this warning.`
		);
	},

	NAMESPACE_CONFLICT(warnings) {
		title(`Conflicting re-exports`);
		for (const warning of warnings) {
			stderr(
				`"${bold(relativeId(warning.reexporter!))}" re-exports "${
					warning.binding
				}" from both "${relativeId(warning.ids![0])}" and "${relativeId(
					warning.ids![1]
				)}" (will be ignored).`
			);
		}
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

					const id = warning.id || warning.loc?.file;
					if (id) {
						let loc = relativeId(id);
						if (warning.loc) {
							loc += `: (${warning.loc.line}:${warning.loc.column})`;
						}
						stderr(bold(loc));
					}
					if (warning.frame) info(warning.frame);
				}
			}
		}
	},

	SOURCEMAP_BROKEN(warnings) {
		title(`Broken sourcemap`);
		info(getRollupUrl(URL_SOURCEMAP_IS_LIKELY_TO_BE_INCORRECT));

		const plugins = [...new Set(warnings.map(({ plugin }) => plugin).filter(Boolean))] as string[];
		stderr(
			`Plugins that transform code (such as ${printQuotedStringList(
				plugins
			)}) should generate accompanying sourcemaps.`
		);
	},

	THIS_IS_UNDEFINED(warnings) {
		title('"this" has been rewritten to "undefined"');
		info(getRollupUrl(URL_THIS_IS_UNDEFINED));
		showTruncatedWarnings(warnings);
	},

	UNRESOLVED_IMPORT(warnings) {
		title('Unresolved dependencies');
		info(getRollupUrl(URL_TREATING_MODULE_AS_EXTERNAL_DEPENDENCY));

		const dependencies = new Map<string, string[]>();
		for (const warning of warnings) {
			getOrCreate(dependencies, relativeId(warning.exporter!), getNewArray).push(
				relativeId(warning.id!)
			);
		}

		for (const [dependency, importers] of dependencies) {
			stderr(`${bold(dependency)} (imported by ${printQuotedStringList(importers)})`);
		}
	},

	UNUSED_EXTERNAL_IMPORT(warnings) {
		title('Unused external imports');
		for (const warning of warnings) {
			stderr(
				warning.names +
					' imported from external module "' +
					warning.exporter +
					'" but never used in ' +
					printQuotedStringList(warning.ids!.map(relativeId)) +
					'.'
			);
		}
	}
};

function defaultBody(log: RollupLog): void {
	if (log.url) {
		info(getRollupUrl(log.url));
	}

	const id = log.loc?.file || log.id;
	if (id) {
		const loc = log.loc ? `${relativeId(id)} (${log.loc.line}:${log.loc.column})` : relativeId(id);

		stderr(bold(relativeId(loc)));
	}

	if (log.frame) info(log.frame);
}

function title(string_: string): void {
	stderr(bold(yellow(`(!) ${string_}`)));
}

function info(url: string): void {
	stderr(gray(url));
}

interface Nested<T> {
	items: T[];
	key: string;
}

function nest<T extends Record<string, any>>(array: readonly T[], property: string): Nested<T>[] {
	const nested: Nested<T>[] = [];
	const lookup = new Map<string, Nested<T>>();

	for (const item of array) {
		const key = item[property];
		getOrCreate(lookup, key, () => {
			const items = {
				items: [],
				key
			};
			nested.push(items);
			return items;
		}).items.push(item);
	}

	return nested;
}

function showTruncatedWarnings(warnings: readonly RollupLog[]): void {
	const nestedByModule = nest(warnings, 'id');

	const displayedByModule = nestedByModule.length > 5 ? nestedByModule.slice(0, 3) : nestedByModule;
	for (const { key: id, items } of displayedByModule) {
		stderr(bold(relativeId(id)));
		stderr(gray(items[0].frame!));

		if (items.length > 1) {
			stderr(`...and ${items.length - 1} other ${items.length > 2 ? 'occurrences' : 'occurrence'}`);
		}
	}

	if (nestedByModule.length > displayedByModule.length) {
		stderr(`\n...and ${nestedByModule.length - displayedByModule.length} other files`);
	}
}

function generateLogFilter(command: Record<string, any>) {
	const filters = ensureArray(command.filterLogs).flatMap(filter => String(filter).split(','));
	if (process.env.ROLLUP_FILTER_LOGS) {
		filters.push(...process.env.ROLLUP_FILTER_LOGS.split(','));
	}
	return getLogFilter(filters);
}
