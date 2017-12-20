const DEBUG = false;
const map = new Map<string, { time: number, start: [number, number] | number }>();

let timeStartHelper: () => number | [number, number];
let timeEndHelper: (previous: number | [number, number]) => number;

if (typeof process === 'undefined' || typeof process.hrtime === 'undefined') {
	timeStartHelper = function timeStartHelper () {
		return window.performance.now();
	};

	timeEndHelper = function timeEndHelper (previous: number) {
		return window.performance.now() - previous;
	};
} else {
	timeStartHelper = function timeStartHelper () {
		return process.hrtime();
	};

	timeEndHelper = function timeEndHelper (previous: [number, number]) {
		const hrtime = process.hrtime(previous);
		return hrtime[0] * 1e3 + Math.floor(hrtime[1] / 1e6);
	};
}

export function timeStart (label: string) {
	if (!map.has(label)) {
		map.set(label, {
			start: undefined,
			time: 0
		});
	}
	map.get(label).start = timeStartHelper();
}

export function timeEnd (label: string) {
	if (map.has(label)) {
		const item = map.get(label);
		item.time += timeEndHelper(item.start);
	}
}

export function flushTime (log = defaultLog) {
	for (const item of map.entries()) {
		log(item[0], item[1].time);
	}
	map.clear();
}

function defaultLog (label: string, time: number) {
	if (DEBUG) {
		/* eslint-disable no-console */
		console.info('%dms: %s', time, label);
		/* eslint-enable no-console */
	}
}
