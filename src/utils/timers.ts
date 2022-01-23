import type { InputOptions, Plugin, SerializedTimings } from '../rollup/types';
import performance from './performance';
import process from './process';

interface Timer {
	memory: number;
	startMemory: number;
	startTime: number;
	time: number;
	totalMemory: number;
}

const NOOP = (): void => {};

let timers = new Map<string, Timer>();

function getPersistedLabel(label: string, level: number): string {
	switch (level) {
		case 1:
			return `# ${label}`;
		case 2:
			return `## ${label}`;
		case 3:
			return label;
		default:
			return `${'  '.repeat(level - 4)}- ${label}`;
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

export let timeStart: (label: string, level?: number) => void = NOOP;
export let timeEnd: (label: string, level?: number) => void = NOOP;

const TIMED_PLUGIN_HOOKS = ['load', 'resolveDynamicImport', 'resolveId', 'transform'] as const;

function getPluginWithTimers(plugin: any, index: number): Plugin {
	for (const hook of TIMED_PLUGIN_HOOKS) {
		if (hook in plugin) {
			let timerLabel = `plugin ${index}`;
			if (plugin.name) {
				timerLabel += ` (${plugin.name})`;
			}
			timerLabel += ` - ${hook}`;

			const func = plugin[hook];

			plugin[hook] = function (...args: readonly unknown[]) {
				timeStart(timerLabel, 4);
				const result = func.apply(this, args);
				timeEnd(timerLabel, 4);
				if (result && typeof result.then === 'function') {
					timeStart(`${timerLabel} (async)`, 4);
					return result.then((hookResult: unknown) => {
						timeEnd(`${timerLabel} (async)`, 4);
						return hookResult;
					});
				}
				return result;
			};
		}
	}
	return plugin;
}

export function initialiseTimers(inputOptions: InputOptions): void {
	if (inputOptions.perf) {
		timers = new Map();
		timeStart = timeStartImpl;
		timeEnd = timeEndImpl;
		inputOptions.plugins = inputOptions.plugins!.map(getPluginWithTimers);
	} else {
		timeStart = NOOP;
		timeEnd = NOOP;
	}
}
