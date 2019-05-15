import { InputOptions, SerializedTimings } from '../rollup/types';

type StartTime = [number, number] | number;

interface Timer {
	memory: number;
	startMemory: number;
	startTime: StartTime;
	time: number;
	totalMemory: number;
}

interface Timers {
	[label: string]: Timer;
}

const NOOP = () => {};
let getStartTime: () => StartTime = () => 0;
let getElapsedTime: (previous: StartTime) => number = () => 0;
let getMemory: () => number = () => 0;
let timers: Timers = {};

const normalizeHrTime = (time: [number, number]) => time[0] * 1e3 + time[1] / 1e6;

function setTimeHelpers() {
	if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
		getStartTime = process.hrtime.bind(process);
		getElapsedTime = (previous: [number, number]) => normalizeHrTime(process.hrtime(previous));
	} else if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		getStartTime = performance.now.bind(performance);
		getElapsedTime = (previous: number) => performance.now() - previous;
	}
	if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
		getMemory = () => process.memoryUsage().heapUsed;
	}
}

function getPersistedLabel(label: string, level: number) {
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

function timeStartImpl(label: string, level = 3) {
	label = getPersistedLabel(label, level);
	if (!timers.hasOwnProperty(label)) {
		timers[label] = {
			memory: 0,
			startMemory: undefined,
			startTime: undefined,
			time: 0,
			totalMemory: 0
		};
	}
	const currentMemory = getMemory();
	timers[label].startTime = getStartTime();
	timers[label].startMemory = currentMemory;
}

function timeEndImpl(label: string, level = 3) {
	label = getPersistedLabel(label, level);
	if (timers.hasOwnProperty(label)) {
		const currentMemory = getMemory();
		timers[label].time += getElapsedTime(timers[label].startTime);
		timers[label].totalMemory = Math.max(timers[label].totalMemory, currentMemory);
		timers[label].memory += currentMemory - timers[label].startMemory;
	}
}

export function getTimings(): SerializedTimings {
	const newTimings: SerializedTimings = {};
	Object.keys(timers).forEach(label => {
		newTimings[label] = [timers[label].time, timers[label].memory, timers[label].totalMemory];
	});
	return newTimings;
}

export let timeStart: (label: string, level?: number) => void = NOOP,
	timeEnd: (label: string, level?: number) => void = NOOP;

const TIMED_PLUGIN_HOOKS: { [hook: string]: boolean } = {
	load: true,
	ongenerate: true,
	onwrite: true,
	resolveDynamicImport: true,
	resolveId: true,
	transform: true,
	transformBundle: true
};

function getPluginWithTimers(plugin: any, index: number): Plugin {
	const timedPlugin: { [hook: string]: any } = {};

	for (const hook of Object.keys(plugin)) {
		if (TIMED_PLUGIN_HOOKS[hook] === true) {
			let timerLabel = `plugin ${index}`;
			if (plugin.name) {
				timerLabel += ` (${plugin.name})`;
			}
			timerLabel += ` - ${hook}`;
			timedPlugin[hook] = function() {
				timeStart(timerLabel, 4);
				const result = plugin[hook].apply(this === timedPlugin ? plugin : this, arguments);
				timeEnd(timerLabel, 4);
				if (result && typeof result.then === 'function') {
					timeStart(`${timerLabel} (async)`, 4);
					result.then(() => timeEnd(`${timerLabel} (async)`, 4));
				}
				return result;
			};
		} else {
			timedPlugin[hook] = plugin[hook];
		}
	}
	return <Plugin>timedPlugin;
}

export function initialiseTimers(inputOptions: InputOptions) {
	if (inputOptions.perf) {
		timers = {};
		setTimeHelpers();
		timeStart = timeStartImpl;
		timeEnd = timeEndImpl;
		inputOptions.plugins = inputOptions.plugins.map(getPluginWithTimers);
	} else {
		timeStart = NOOP;
		timeEnd = NOOP;
	}
}
