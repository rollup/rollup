import type {
	NormalizedInputOptions,
	Plugin,
	PluginHooks,
	SerializedTimings
} from '../rollup/types';
import { doNothing } from './doNothing';
import performance from './performance';
import process from './process';

interface Timer {
	memory: number;
	startMemory: number;
	startTime: number;
	time: number;
	totalMemory: number;
}

let timers = new Map<string, Timer>();

function getPersistedLabel(label: string, level: number): string {
	switch (level) {
		case 1: {
			return `# ${label}`;
		}
		case 2: {
			return `## ${label}`;
		}
		case 3: {
			return label;
		}
		default: {
			return `${'  '.repeat(level - 4)}- ${label}`;
		}
	}
}

function timeStartImpl(label: string, level = 3): void {
	label = getPersistedLabel(label, level);

	const startMemory = process.memoryUsage().heapUsed;
	const startTime = performance.now();

	const timer = timers.get(label);

	if (timer === undefined) {
		timers.set(label, {
			memory: 0,
			startMemory,
			startTime,
			time: 0,
			totalMemory: 0
		});
	} else {
		timer.startMemory = startMemory;
		timer.startTime = startTime;
	}
}

function timeEndImpl(label: string, level = 3): void {
	label = getPersistedLabel(label, level);

	const timer = timers.get(label);

	if (timer !== undefined) {
		const currentMemory = process.memoryUsage().heapUsed;
		timer.memory += currentMemory - timer.startMemory;
		timer.time += performance.now() - timer.startTime;
		timer.totalMemory = Math.max(timer.totalMemory, currentMemory);
	}
}

export function getTimings(): SerializedTimings {
	const newTimings: SerializedTimings = {};

	for (const [label, { memory, time, totalMemory }] of timers) {
		newTimings[label] = [time, memory, totalMemory];
	}
	return newTimings;
}

export let timeStart: (label: string, level?: number) => void = doNothing;
export let timeEnd: (label: string, level?: number) => void = doNothing;

const TIMED_PLUGIN_HOOKS: readonly (keyof PluginHooks)[] = [
	'augmentChunkHash',
	'buildEnd',
	'buildStart',
	'generateBundle',
	'load',
	'moduleParsed',
	'options',
	'outputOptions',
	'renderChunk',
	'renderDynamicImport',
	'renderStart',
	'resolveDynamicImport',
	'resolveFileUrl',
	'resolveId',
	'resolveImportMeta',
	'shouldTransformCachedModule',
	'transform',
	'writeBundle'
];

function getPluginWithTimers(plugin: any, index: number): Plugin {
	if (plugin._hasTimer) return plugin;
	plugin._hasTimer = true;
	for (const hook of TIMED_PLUGIN_HOOKS) {
		if (hook in plugin) {
			let timerLabel = `plugin ${index}`;
			if (plugin.name) {
				timerLabel += ` (${plugin.name})`;
			}
			timerLabel += ` - ${hook}`;

			const handler = function (this: any, ...parameters: readonly unknown[]) {
				timeStart(timerLabel, 4);
				const result = hookFunction.apply(this, parameters);
				timeEnd(timerLabel, 4);
				return result;
			};

			let hookFunction: any;
			if (typeof plugin[hook].handler === 'function') {
				hookFunction = plugin[hook].handler;
				plugin[hook].handler = handler;
			} else {
				hookFunction = plugin[hook];
				plugin[hook] = handler;
			}
		}
	}
	return plugin;
}

export function initialiseTimers(inputOptions: NormalizedInputOptions): void {
	if (inputOptions.perf) {
		timers = new Map();
		timeStart = timeStartImpl;
		timeEnd = timeEndImpl;
		inputOptions.plugins = inputOptions.plugins!.map(getPluginWithTimers);
	} else {
		timeStart = doNothing;
		timeEnd = doNothing;
	}
}
