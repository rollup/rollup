const path = require('path');
const fs = require('fs');
const rollup = require('../dist/rollup.js');
const chalk = require('chalk');
const { loadPerfConfig, targetDir } = require('./load-perf-config');

const perfFile = path.resolve(targetDir, 'rollup.perf.json');

let numberOfRunsToAverage = 6;
let numberOfDiscardedResults = 1;
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
	chalk.bold(
		`Calculating the average of ${chalk.cyan(numberOfRunsToAverage)} runs discarding ${chalk.cyan(
			numberOfDiscardedResults
		)} outliers.\n`
	) + 'Run "npm run perf <number of runs> <number of discarded results>" to change that.'
);

function getAverage(times) {
	const initialAverage = times.reduce((sum, time) => sum + time, 0) / numberOfRunsToAverage;
	return (
		times
			.map(time => ({ time, deviation: Math.abs(time - initialAverage) }))
			.sort(({ deviation: dev1 }, { deviation: dev2 }) => dev2 - dev1)
			.slice(numberOfDiscardedResults)
			.reduce((sum, { time }) => sum + time, 0) /
		(numberOfRunsToAverage - numberOfDiscardedResults)
	);
}

async function getAverageTimings(config) {
	await buildAndGetTimings(config);
	console.info('Completed initial run (Discarded).');
	const timings = await buildAndGetTimings(config);
	console.info('Completed run 1.');
	Object.keys(timings).forEach(label => {
		timings[label] = [timings[label]];
	});
	for (let currentRun = 2; currentRun <= numberOfRunsToAverage; currentRun++) {
		const currentTimings = await buildAndGetTimings(config);
		console.info(`Completed run ${currentRun}.`);
		Object.keys(timings).forEach(label => {
			if (!currentTimings.hasOwnProperty(label)) {
				delete timings[label];
			} else {
				timings[label].push(currentTimings[label]);
			}
		});
	}
	Object.keys(timings).forEach(label => {
		timings[label] = getAverage(timings[label]);
	});
	return timings;
}

async function buildAndGetTimings(config) {
	config.perf = true;
	if (Array.isArray(config.output)) {
		config.output = config.output[0];
	}
	gc();
	const bundle = await rollup.rollup(config);
	await bundle.generate(config.output);
	return bundle.getTimings();
}

function safeAndPrintTimings(timings) {
	const existingTimings = getExistingTimings();
	console.info('');
	Object.keys(timings).forEach(label => {
		let color = chalk;
		if (label[0] === '#') {
			color = color.bold;
			if (label[1] !== '#') {
				color = color.underline;
			}
		}
		console.info(color(`${label}: ${getFormattedTime(timings[label], existingTimings[label])}`));
	});
	if (Object.keys(existingTimings).length === 0) persistTimings(timings);
}

function getExistingTimings() {
	try {
		const timings = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
		console.info(
			chalk.bold(
				`Comparing with ${chalk.cyan(perfFile)}. Delete this file to create a new base line.`
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
			chalk.bold(`Saving performance information to new reference file ${chalk.cyan(perfFile)}.`)
		);
	} catch (e) {
		console.error(
			chalk.bold(`Could not persist performance information in ${chalk.cyan(perfFile)}.`)
		);
		system.exit(1);
	}
}

const MIN_ABSOLUTE_DEVIATION = 10;
const RELATIVE_DEVIATION_FOR_COLORING = 5;

function getFormattedTime(currentTime, persistedTime = currentTime) {
	let color = chalk,
		formattedTime = `${currentTime.toFixed(0)}ms`;
	const absoluteDeviation = Math.abs(currentTime - persistedTime);
	if (absoluteDeviation > MIN_ABSOLUTE_DEVIATION) {
		const sign = currentTime >= persistedTime ? '+' : '-';
		const relativeDeviation = 100 * (absoluteDeviation / persistedTime);
		formattedTime += ` (${sign}${absoluteDeviation.toFixed(
			0
		)}ms, ${sign}${relativeDeviation.toFixed(1)}%)`;
		if (relativeDeviation > RELATIVE_DEVIATION_FOR_COLORING) {
			color = currentTime >= persistedTime ? color.red : color.green;
		}
	}
	return color(formattedTime);
}

loadPerfConfig()
	.then(getAverageTimings)
	.then(safeAndPrintTimings);
