type StartTime = [number, number] | number;
type Timer = { time: number; start: StartTime };
type Timers = { [label: string]: Timer };
export type SerializedTimings = { [label: string]: number };

const NOOP = () => {};

let getStartTime: () => StartTime = () => 0;
let getElapsedTime: (previous: StartTime) => number = () => 0;

let timers: Timers = {};

const normalizeTime = (time: [number, number]) => time[0] * 1e3 + Math.floor(time[1] / 1e6);

function setTimeHelpers() {
	if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
		getStartTime = process.hrtime.bind(process);
		getElapsedTime = (previous: [number, number]) => normalizeTime(process.hrtime(previous));
	} else if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		getStartTime = performance.now.bind(performance);
		getElapsedTime = (previous: number) => performance.now() - previous;
	}
}

function timeStartImpl(label: string) {
	if (!timers.hasOwnProperty(label)) {
		timers[label] = {
			start: undefined,
			time: 0
		};
	}
	timers[label].start = getStartTime();
}

function timeEndImpl(label: string) {
	if (timers.hasOwnProperty(label)) {
		timers[label].time += getElapsedTime(timers[label].start);
	}
}

export function getTimings(): SerializedTimings {
	const newTimings: SerializedTimings = {};
	Object.keys(timers).forEach(label => {
		newTimings[label] = timers[label].time;
	});
	return newTimings;
}

export let timeStart: (label: string) => void = NOOP,
	timeEnd: (label: string) => void = NOOP;

export function initialiseTimers(enableLogging: boolean) {
	if (enableLogging) {
		timers = {};
		setTimeHelpers();
		timeStart = timeStartImpl;
		timeEnd = timeEndImpl;
	} else {
		timeStart = NOOP;
		timeEnd = NOOP;
	}
}
