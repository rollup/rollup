/* global gc */

import { mkdir, symlink, writeFile } from 'node:fs/promises';
import { chdir } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createColors } from 'colorette';
import prettyBytes from 'pretty-bytes';
import { runWithEcho } from '../helpers.js';
import reportCollector from './report-collector.js';
import { newRollup, previousRollup, previousVersion } from './rollup-artefacts.js';

/**
 * @typedef {Record<string,{memory:number,time:number}>} CollectedTimings
 */

/**
 * @typedef {Record<string, [number, number, number][]>} AccumulatedTimings
 */

const PERF_DIRECTORY = new URL('../../perf/', import.meta.url);
const ENTRY = new URL('entry.js', PERF_DIRECTORY);
const THREEJS_COPIES = 10;
const { bold, underline, cyan, red, green } = createColors();
const MIN_ABSOLUTE_TIME_DEVIATION = 10;
const RELATIVE_DEVIATION_FOR_COLORING = 5;
const RUNS_TO_AVERAGE = 5;
const DISCARDED_RESULTS = 2;

await ensureBenchmarkExists();
await calculatePrintAndPersistTimings();

async function ensureBenchmarkExists() {
	const THREE_DIRECTORY = new URL('threejs1/', PERF_DIRECTORY);
	// mkdir only returns undefined if the directory already exists, in which case
	// we do not need to prepare anything
	if (await mkdir(THREE_DIRECTORY, { recursive: true })) {
		console.info(bold(`Creating a benchmark to bundle ${cyan(THREEJS_COPIES)} copies of ThreeJS.`));
		const promises = [
			runWithEcho('git', [
				'clone',
				'--depth',
				'1',
				'--branch',
				'r108',
				'https://github.com/mrdoob/three.js.git',
				fileURLToPath(THREE_DIRECTORY)
			])
		];
		for (let index = 2; index <= THREEJS_COPIES; index++) {
			promises.push(symlink(THREE_DIRECTORY, new URL(`threejs${index}`, PERF_DIRECTORY)));
		}
		let entry = '';
		for (let index = 1; index <= THREEJS_COPIES; index++) {
			entry += `export * as threejs${index} from './threejs${index}/src/Three.js';\n`;
		}
		promises.push(writeFile(ENTRY, entry));
		await Promise.all(promises);
	}
}

async function calculatePrintAndPersistTimings() {
	console.info(
		bold(
			`Comparing against rollup@${previousVersion}.\nCalculating the average of ${cyan(RUNS_TO_AVERAGE)} runs discarding the ${cyan(
				DISCARDED_RESULTS
			)} largest results.`
		)
	);
	chdir(fileURLToPath(PERF_DIRECTORY));
	/** @type {AccumulatedTimings} */
	const accumulatedPreviousTimings = {};
	await buildAndGetTimings(previousRollup, accumulatedPreviousTimings);
	/** @type {AccumulatedTimings} */
	const accumulatedNewTimings = {};
	await buildAndGetTimings(
		/** @type{typeof import('rollup').rollup} */ (newRollup),
		accumulatedNewTimings
	);
	for (let currentRun = 1; currentRun < RUNS_TO_AVERAGE; currentRun++) {
		const numberOfLinesToClear = printMeasurements(
			getAverage(accumulatedNewTimings, currentRun),
			getAverage(accumulatedPreviousTimings, currentRun),
			/^#/
		);
		console.info(`Completed run ${currentRun}.`);
		await buildAndGetTimings(previousRollup, accumulatedPreviousTimings);
		await buildAndGetTimings(
			/** @type{typeof import('rollup').rollup} */ (newRollup),
			accumulatedNewTimings
		);
		clearLines(numberOfLinesToClear);
	}
	reportCollector.startRecord();
	printMeasurements(
		getAverage(accumulatedNewTimings, RUNS_TO_AVERAGE),
		getAverage(accumulatedPreviousTimings, RUNS_TO_AVERAGE)
	);
	await reportCollector.outputMsg();
}

/**
 * @param {typeof import('rollup').rollup} rollup
 * @param {AccumulatedTimings} accumulatedTimings
 */
async function buildAndGetTimings(rollup, accumulatedTimings) {
	if (typeof gc === 'undefined') {
		throw new TypeError('Garbage collection is not enabled');
	}
	gc();
	const bundle = await rollup({
		input: fileURLToPath(ENTRY),
		onLog() {},
		perf: true
	});
	await bundle.generate({ format: 'es' });
	if (!bundle.getTimings) {
		throw new Error('Timings not found in the bundle.');
	}
	for (const [label, timings] of Object.entries(bundle.getTimings())) {
		(accumulatedTimings[label] ||= []).push(timings);
	}
}

/**
 * @param {AccumulatedTimings} accumulatedMeasurements
 * @param {number} runs
 * @return {CollectedTimings}
 */
function getAverage(accumulatedMeasurements, runs) {
	/**
	 * @type {CollectedTimings}
	 */
	const average = {};
	for (const label of Object.keys(accumulatedMeasurements)) {
		average[label] = {
			memory: getSingleAverage(
				accumulatedMeasurements[label].map(timing => timing[2]),
				runs,
				DISCARDED_RESULTS
			),
			time: getSingleAverage(
				accumulatedMeasurements[label].map(timing => timing[0]),
				runs,
				DISCARDED_RESULTS
			)
		};
	}
	return average;
}

/**
 * @param {number[]} times
 * @param {number} runs
 * @param {number} discarded
 * @return {number}
 */
function getSingleAverage(times, runs, discarded) {
	const actualDiscarded = Math.min(discarded, runs - 1);
	return (
		times
			.sort()
			.reverse()
			.slice(actualDiscarded)
			.reduce((sum, time) => sum + time, 0) /
		(runs - actualDiscarded)
	);
}

/**
 * @param {CollectedTimings} newAverage
 * @param {CollectedTimings} previousAverage
 * @param {RegExp} filter
 * @return {number}
 */
function printMeasurements(newAverage, previousAverage, filter = /.*/) {
	const newPrintedLabels = Object.keys(newAverage).filter(predicateLabel);
	const previousPrintedLabels = Object.keys(previousAverage).filter(predicateLabel);

	const newTreeShakings = newPrintedLabels.filter(isTreeShakingLabel);
	const oldTreeShakings = previousPrintedLabels.filter(isTreeShakingLabel);

	const addedTreeShaking = newTreeShakings.length - oldTreeShakings.length;
	let treeShakingCount = 0;

	for (const label of newPrintedLabels) {
		/**
		 * @type {function(string): string}
		 */
		let color = identity;
		if (label[0] === '#') {
			color = bold;
			if (label[1] !== '#') {
				color = underline;
			}
		}
		const texts = [];
		if (isTreeShakingLabel(label)) {
			treeShakingCount++;
			if (addedTreeShaking < 0 && treeShakingCount === newTreeShakings.length) {
				texts.push(generateSingleReport(label));
				for (const label of oldTreeShakings.slice(addedTreeShaking)) {
					const { time, memory } = previousAverage[label];
					texts.push(`${label}: ${time.toFixed(0)}ms, ${prettyBytes(memory)}, removed stage`);
				}
			} else if (addedTreeShaking > 0 && treeShakingCount > oldTreeShakings.length) {
				texts.push(generateSingleReport(label, ', new stage'));
			} else {
				texts.push(generateSingleReport(label));
			}
		} else {
			texts.push(generateSingleReport(label));
		}
		for (const text of texts) {
			reportCollector.push(text);
			console.info(color(text));
		}
	}
	return Math.max(newPrintedLabels.length, previousPrintedLabels.length) + 2;

	/**
	 * @param {string} label
	 */
	function predicateLabel(label) {
		return filter.test(label);
	}

	/**
	 * @param {string} label
	 * @param {string} addon
	 */
	function generateSingleReport(label, addon = '') {
		return `${label}: ${getFormattedTime(
			newAverage[label].time,
			previousAverage[label]?.time
		)}, ${getFormattedMemory(newAverage[label].memory, previousAverage[label]?.memory)}${addon}`;
	}
}

/**
 * @param {string} label
 */
function isTreeShakingLabel(label) {
	return label.startsWith('treeshaking pass');
}

/**
 * @param {number} measuredTime
 * @param {number} baseTime
 * @return {string}
 */
function getFormattedTime(measuredTime, baseTime = measuredTime) {
	/**
	 * @type {function(string): string}
	 */
	let color = identity,
		formattedTime = `${measuredTime.toFixed(0)}ms`;
	const absoluteDeviation = Math.abs(measuredTime - baseTime);
	if (absoluteDeviation > MIN_ABSOLUTE_TIME_DEVIATION) {
		const sign = measuredTime >= baseTime ? '+' : '-';
		const relativeDeviation = 100 * (absoluteDeviation / baseTime);
		formattedTime += ` (${sign}${absoluteDeviation.toFixed(
			0
		)}ms, ${sign}${relativeDeviation.toFixed(1)}%)`;
		if (relativeDeviation > RELATIVE_DEVIATION_FOR_COLORING) {
			color = measuredTime >= baseTime ? red : green;
		}
	}
	return color(formattedTime);
}

/**
 * @param {number} currentMemory
 * @param {number} persistedMemory
 * @return {string}
 */
function getFormattedMemory(currentMemory, persistedMemory = currentMemory) {
	/**
	 * @type {function(string): string}
	 */
	let color = identity,
		formattedMemory = prettyBytes(currentMemory);
	const absoluteDeviation = Math.abs(currentMemory - persistedMemory);
	const sign = currentMemory >= persistedMemory ? '+' : '-';
	const relativeDeviation = 100 * (absoluteDeviation / persistedMemory);
	if (relativeDeviation > RELATIVE_DEVIATION_FOR_COLORING) {
		formattedMemory += ` (${sign}${relativeDeviation.toFixed(0)}%)`;
		color = currentMemory >= persistedMemory ? red : green;
	}
	return color(formattedMemory);
}

/**
 * @param {number} numberOfLines
 */
function clearLines(numberOfLines) {
	console.info('\u001B[A' + '\u001B[2K\u001B[A'.repeat(numberOfLines));
}

/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
function identity(x) {
	return x;
}
