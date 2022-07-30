/* eslint-disable import/no-unresolved */
/* global gc */

import { readFileSync, writeFileSync } from 'node:fs';
import { argv, chdir, cwd, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createColors } from 'colorette';
import prettyBytes from 'pretty-bytes';
import { loadConfigFile } from '../dist/loadConfigFile.js';
import { rollup } from '../dist/rollup.js';
import { findConfigFileName } from './find-config.js';

const initialDir = cwd();
const targetDir = fileURLToPath(new URL('../perf', import.meta.url).href);
const perfFile = fileURLToPath(new URL('../perf/rollup.perf.json', import.meta.url).href);
const { bold, underline, cyan, red, green } = createColors();
const MIN_ABSOLUTE_TIME_DEVIATION = 10;
const RELATIVE_DEVIATION_FOR_COLORING = 5;

chdir(targetDir);
const configFile = await findConfigFileName(targetDir);
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

function getAverage(accumulatedMeasurements, runs, discarded) {
	const average = {};
	Object.keys(accumulatedMeasurements).forEach(label => {
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
	});
	return average;
}

async function calculatePrintAndPersistTimings(config, existingTimings) {
	const timings = await buildAndGetTimings(config);
	Object.keys(timings).forEach(label => {
		timings[label] = [timings[label]];
	});
	for (let currentRun = 1; currentRun < numberOfRunsToAverage; currentRun++) {
		const numberOfLinesToClear = printMeasurements(
			getAverage(timings, currentRun, numberOfDiscardedResults),
			existingTimings,
			/^#/
		);
		console.info(`Completed run ${currentRun}.`);
		const currentTimings = await buildAndGetTimings(config);
		clearLines(numberOfLinesToClear);
		Object.keys(timings).forEach(label => {
			if (!currentTimings.hasOwnProperty(label)) {
				delete timings[label];
			} else {
				timings[label].push(currentTimings[label]);
			}
		});
	}
	const averageTimings = getAverage(timings, numberOfRunsToAverage, numberOfDiscardedResults);
	printMeasurements(averageTimings, existingTimings);
	if (Object.keys(existingTimings).length === 0) persistTimings(averageTimings);
}

async function buildAndGetTimings(config) {
	config.perf = true;
	if (Array.isArray(config.output)) {
		config.output = config.output[0];
	}
	gc();
	chdir(targetDir);
	const bundle = await rollup(config);
	chdir(initialDir);
	await bundle.generate(config.output);
	return bundle.getTimings();
}

function printMeasurements(average, existingAverage, filter = /.*/) {
	const printedLabels = Object.keys(average).filter(label => filter.test(label));
	console.info('');
	printedLabels.forEach(label => {
		let color = text => text;
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
	});
	return printedLabels.length + 2;
}

function clearLines(numberOfLines) {
	// console.info('\33[A' + '\33[2K\33[A'.repeat(numberOfLines));
}

function getExistingTimings() {
	try {
		const timings = JSON.parse(readFileSync(perfFile, 'utf8'));
		console.info(
			bold(`Comparing with ${cyan(perfFile)}. Delete this file to create a new base line.`)
		);
		return timings;
	} catch (e) {
		return {};
	}
}

function persistTimings(timings) {
	try {
		writeFileSync(perfFile, JSON.stringify(timings, null, 2), 'utf8');
		console.info(bold(`Saving performance information to new reference file ${cyan(perfFile)}.`));
	} catch (e) {
		console.error(bold(`Could not persist performance information in ${cyan(perfFile)}.`));
		exit(1);
	}
}

function getFormattedTime(currentTime, persistedTime = currentTime) {
	let color = text => text,
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

function getFormattedMemory(currentMemory, persistedMemory = currentMemory) {
	let color = text => text,
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
