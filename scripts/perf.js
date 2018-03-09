/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');
const rollup = require('../dist/rollup.js');
const chalk = require('chalk');

const TARGET_DIR = path.resolve(__dirname, '..', 'perf');
const CONFIG_FILE = path.resolve(TARGET_DIR, 'rollup.config.js');
const PERF_FILE = path.resolve(TARGET_DIR, 'rollup.perf.json');

try {
	fs.accessSync(CONFIG_FILE, fs.constants.R_OK);
} catch (e) {
	console.error(`No valid "rollup.config.js" in ${TARGET_DIR}. Did you "npm run perf:init"?`);
	process.exit(1);
}

let numberOfRunsToAverage = 3;
if (process.argv.length === 3) {
	numberOfRunsToAverage = Number.parseInt(process.argv[2]);
}
console.info(
	chalk.bold(`Calculating the average of ${chalk.cyan(numberOfRunsToAverage)} runs.\n`) +
		'Run "npm run perf <number of runs>" to change that.'
);

async function loadConfig() {
	const bundle = await rollup.rollup({
		input: CONFIG_FILE,
		external: id => (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		onwarn: warning => console.error(warning.message)
	});
	const configs = loadConfigFromCode((await bundle.generate({ format: 'cjs' })).code);
	return Array.isArray(configs) ? configs[0] : configs;
}

function loadConfigFromCode(code) {
	const defaultLoader = require.extensions['.js'];
	require.extensions['.js'] = (module, filename) => {
		if (filename === CONFIG_FILE) {
			module._compile(code, filename);
		} else {
			defaultLoader(module, filename);
		}
	};
	delete require.cache[CONFIG_FILE];
	return require(CONFIG_FILE);
}

async function getAverageTimings(config) {
	await buildAndGetTimings(config);
	console.info('Completed initial run (Discarded).');
	const timings = await buildAndGetTimings(config);
	console.info('Completed run 1.');
	for (let currentRun = 2; currentRun <= numberOfRunsToAverage; currentRun++) {
		const currentTimings = await buildAndGetTimings(config);
		console.info(`Completed run ${currentRun}.`);
		Object.keys(timings).forEach(label => {
			if (!currentTimings.hasOwnProperty(label)) {
				delete timings[label];
			} else {
				timings[label] += currentTimings[label];
			}
		});
	}
	Object.keys(timings).forEach(label => {
		timings[label] /= numberOfRunsToAverage;
	});
	return timings;
}

async function buildAndGetTimings(config) {
	config.perf = true;
	if (Array.isArray(config.output)) {
		config.output = config.output[0];
	}
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
		const timings = JSON.parse(fs.readFileSync(PERF_FILE, 'utf8'));
		console.info(
			chalk.bold(
				`Comparing with ${chalk.cyan(PERF_FILE)}. Delete this file to create a new base line.`
			)
		);
		return timings;
	} catch (e) {
		return {};
	}
}

function persistTimings(timings) {
	try {
		fs.writeFileSync(PERF_FILE, JSON.stringify(timings, null, 2), 'utf8');
		console.info(
			chalk.bold(`Saving performance information to new reference file ${chalk.cyan(PERF_FILE)}.`)
		);
	} catch (e) {
		console.error(
			chalk.bold(`Could not persist performance information in ${chalk.cyan(PERF_FILE)}.`)
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
		const relativeDeviation = 100 * (absoluteDeviation / currentTime);
		formattedTime += ` (${sign}${absoluteDeviation.toFixed(
			0
		)}ms, ${sign}${relativeDeviation.toFixed(1)}%)`;
		if (relativeDeviation > RELATIVE_DEVIATION_FOR_COLORING) {
			color = currentTime >= persistedTime ? color.red : color.green;
		}
	}
	return color(formattedTime);
}

loadConfig()
	.then(getAverageTimings)
	.then(safeAndPrintTimings);
