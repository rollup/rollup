/* global gc */

const fs = require('fs');
const path = require('path');
const colorette = require('colorette');
const prettyBytes = require('pretty-bytes');
const rollup = require('../dist/rollup.js');
const { loadPerfConfig, targetDir } = require('./load-perf-config');

const initialDir = process.cwd();
const perfFile = path.resolve(targetDir, 'rollup.perf.json');

let numberOfRunsToAverage = 6;
let numberOfDiscardedResults = 3;
if (process.argv.length >= 3) {
	numberOfRunsToAverage = Number.parseInt(process.argv[2]);
	if (process.argv.length >= 4) {
		numberOfDiscardedResults = Number.parseInt(process.argv[3]);
	}
}
if (!(numberOfDiscardedResults >= 0) || !(numberOfDiscardedResults < numberOfRunsToAverage)) {
	console.error(
		`Invalid parameters: runs = ${numberOfRunsToAverage}, discarded = ${numberOfDiscardedResults}.\n` +
			'Usage: "npm run perf [<number of runs> [<number of discarded results>]]"\n' +
			'where 0 <= <number of discarded results> < <number of runs>'
	);
	process.exit(1);
}
console.info(
	colorette.bold(
		`Calculating the average of ${colorette.cyan(
			numberOfRunsToAverage
		)} runs discarding the ${colorette.cyan(numberOfDiscardedResults)} largest results.\n`
	) + 'Run "npm run perf <number of runs> <number of discarded results>" to change that.'
);

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
	process.chdir(targetDir);
	const bundle = await rollup.rollup(config);
	process.chdir(initialDir);
	await bundle.generate(config.output);
	return bundle.getTimings();
}

function printMeasurements(average, existingAverage, filter = /.*/) {
	const printedLabels = Object.keys(average).filter(label => filter.test(label));
	console.info('');
	printedLabels.forEach(label => {
		let color = text => text;
		if (label[0] === '#') {
			color = colorette.bold;
			if (label[1] !== '#') {
				color = colorette.underline;
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
	console.info('\33[A' + '\33[2K\33[A'.repeat(numberOfLines));
}

function getExistingTimings() {
	try {
		const timings = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
		console.info(
			colorette.bold(
				`Comparing with ${colorette.cyan(perfFile)}. Delete this file to create a new base line.`
			)
		);
		return timings;
	} catch (e) {
		return {};
	}
}

function persistTimings(timings) {
	try {
		fs.writeFileSync(perfFile, JSON.stringify(timings, null, 2), 'utf8');
		console.info(
			colorette.bold(
				`Saving performance information to new reference file ${colorette.cyan(perfFile)}.`
			)
		);
	} catch (e) {
		console.error(
			colorette.bold(`Could not persist performance information in ${colorette.cyan(perfFile)}.`)
		);
		process.exit(1);
	}
}

const MIN_ABSOLUTE_TIME_DEVIATION = 10;
const RELATIVE_DEVIATION_FOR_COLORING = 5;

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
			color = currentTime >= persistedTime ? colorette.red : colorette.green;
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
		color = currentMemory >= persistedMemory ? colorette.red : colorette.green;
	}
	return color(formattedMemory);
}

loadPerfConfig().then(async config =>
	calculatePrintAndPersistTimings(config, await getExistingTimings())
);
