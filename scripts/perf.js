/* global gc */

import { readFileSync, writeFileSync } from 'node:fs';
import { argv, chdir, cwd, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createColors } from 'colorette';
import prettyBytes from 'pretty-bytes';
// eslint-disable-next-line import/no-unresolved
import { loadConfigFile } from '../dist/loadConfigFile.js';
// eslint-disable-next-line import/no-unresolved
import { rollup } from '../dist/rollup.js';
import { findConfigFileName } from './find-config.js';

/**
 * @typedef {Record<string,{memory:number,time:number}>} PersistedTimings
 */

/**
 * @typedef {Record<string, [number, number, number][]>} AccumulatedTimings
 */

const initialDirectory = cwd();
const targetDirectory = fileURLToPath(new URL('../perf', import.meta.url).href);
const perfFile = fileURLToPath(new URL('../perf/rollup.perf.json', import.meta.url).href);
const { bold, underline, cyan, red, green } = createColors();
const MIN_ABSOLUTE_TIME_DEVIATION = 10;
const RELATIVE_DEVIATION_FOR_COLORING = 5;

chdir(targetDirectory);
const configFile = await findConfigFileName(targetDirectory);
const configs = await loadConfigFile(
	configFile,
	configFile.endsWith('.ts') ? { configPlugin: 'typescript' } : {}
);

let numberOfRunsToAverage = 6;
let numberOfDiscardedResults = 3;
if (argv.length >= 3) {
	numberOfRunsToAverage = Number.parseInt(argv[2]);
	if (argv.length >= 4) {
		numberOfDiscardedResults = Number.parseInt(argv[3]);
	}
}
if (!(numberOfDiscardedResults >= 0) || !(numberOfDiscardedResults < numberOfRunsToAverage)) {
	console.error(
		`Invalid parameters: runs = ${numberOfRunsToAverage}, discarded = ${numberOfDiscardedResults}.\n` +
			'Usage: "npm run perf [<number of runs> [<number of discarded results>]]"\n' +
			'where 0 <= <number of discarded results> < <number of runs>'
	);
	exit(1);
}
console.info(
	bold(
		`Calculating the average of ${cyan(numberOfRunsToAverage)} runs discarding the ${cyan(
			numberOfDiscardedResults
		)} largest results.\n`
	) + 'Run "npm run perf <number of runs> <number of discarded results>" to change that.'
);

await calculatePrintAndPersistTimings(configs.options[0], await getExistingTimings());

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
 * @param {AccumulatedTimings} accumulatedMeasurements
 * @param {number} runs
 * @param {number} discarded
 * @return {PersistedTimings}
 */
function getAverage(accumulatedMeasurements, runs, discarded) {
	/**
	 * @type {PersistedTimings}
	 */
	const average = {};
	for (const label of Object.keys(accumulatedMeasurements)) {
		average[label] = {
			memory: getSingleAverage(
				accumulatedMeasurements[label].map(timing => timing[2]),
				runs,
				discarded
			),
			time: getSingleAverage(
				accumulatedMeasurements[label].map(timing => timing[0]),
				runs,
				discarded
			)
		};
	}
	return average;
}

/**
 * @param {import('../dist/rollup.js').MergedRollupOptions} config
 * @param {PersistedTimings} existingTimings
 * @return {Promise<void>}
 */
async function calculatePrintAndPersistTimings(config, existingTimings) {
	const serializedTimings = await buildAndGetTimings(config);
	/**
	 * @type {Record<string, [number, number, number][]>}
	 */
	const accumulatedTimings = {};
	for (const label of Object.keys(serializedTimings)) {
		accumulatedTimings[label] = [serializedTimings[label]];
	}
	for (let currentRun = 1; currentRun < numberOfRunsToAverage; currentRun++) {
		const numberOfLinesToClear = printMeasurements(
			getAverage(accumulatedTimings, currentRun, numberOfDiscardedResults),
			existingTimings,
			/^#/
		);
		console.info(`Completed run ${currentRun}.`);
		const currentTimings = await buildAndGetTimings(config);
		clearLines(numberOfLinesToClear);
		for (const label of Object.keys(accumulatedTimings)) {
			if (currentTimings.hasOwnProperty(label)) {
				accumulatedTimings[label].push(currentTimings[label]);
			} else {
				delete accumulatedTimings[label];
			}
		}
	}
	const averageTimings = getAverage(
		accumulatedTimings,
		numberOfRunsToAverage,
		numberOfDiscardedResults
	);
	printMeasurements(averageTimings, existingTimings);
	if (Object.keys(existingTimings).length === 0) {
		persistTimings(averageTimings);
	}
}

/**
 * @param {import('../dist/rollup.js').MergedRollupOptions} config
 * @return {Promise<import('../dist/rollup.js').SerializedTimings>}
 */
async function buildAndGetTimings(config) {
	config.perf = true;
	const output = Array.isArray(config.output) ? config.output[0] : config.output;
	// @ts-expect-error garbage collection may not be enabled
	gc();
	chdir(targetDirectory);
	const bundle = await rollup(config);
	chdir(initialDirectory);
	await bundle.generate(output);
	if (!bundle.getTimings) {
		throw new Error('Timings not found in the bundle.');
	}
	return bundle.getTimings();
}

/**
 * @param {PersistedTimings} average
 * @param {PersistedTimings} existingAverage
 * @param {RegExp} filter
 * @return {number}
 */
function printMeasurements(average, existingAverage, filter = /.*/) {
	const printedLabels = Object.keys(average).filter(label => filter.test(label));
	console.info('');
	for (const label of printedLabels) {
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
		console.info(
			color(
				`${label}: ${getFormattedTime(
					average[label].time,
					existingAverage[label] && existingAverage[label].time
				)}, ${getFormattedMemory(
					average[label].memory,
					existingAverage[label] && existingAverage[label].memory
				)}`
			)
		);
	}
	return printedLabels.length + 2;
}

/**
 * @param {number} numberOfLines
 */
function clearLines(numberOfLines) {
	console.info('\u001B[A' + '\u001B[2K\u001B[A'.repeat(numberOfLines));
}

/**
 * @return {PersistedTimings}
 */
function getExistingTimings() {
	try {
		const timings = JSON.parse(readFileSync(perfFile, 'utf8'));
		console.info(
			bold(`Comparing with ${cyan(perfFile)}. Delete this file to create a new base line.`)
		);
		return timings;
	} catch {
		return {};
	}
}

/**
 * @param {PersistedTimings} timings
 */
function persistTimings(timings) {
	try {
		writeFileSync(perfFile, JSON.stringify(timings, null, 2), 'utf8');
		console.info(bold(`Saving performance information to new reference file ${cyan(perfFile)}.`));
	} catch {
		console.error(bold(`Could not persist performance information in ${cyan(perfFile)}.`));
		exit(1);
	}
}

/**
 * @param {number} currentTime
 * @param {number} persistedTime
 * @return {string}
 */
function getFormattedTime(currentTime, persistedTime = currentTime) {
	/**
	 * @type {function(string): string}
	 */
	let color = identity,
		formattedTime = `${currentTime.toFixed(0)}ms`;
	const absoluteDeviation = Math.abs(currentTime - persistedTime);
	if (absoluteDeviation > MIN_ABSOLUTE_TIME_DEVIATION) {
		const sign = currentTime >= persistedTime ? '+' : '-';
		const relativeDeviation = 100 * (absoluteDeviation / persistedTime);
		formattedTime += ` (${sign}${absoluteDeviation.toFixed(
			0
		)}ms, ${sign}${relativeDeviation.toFixed(1)}%)`;
		if (relativeDeviation > RELATIVE_DEVIATION_FOR_COLORING) {
			color = currentTime >= persistedTime ? red : green;
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
 * @template T
 * @param {T} x
 * @returns {T}
 */
function identity(x) {
	return x;
}
