const assert = require('assert');
const path = require('path');
const sander = require('sander');

exports.compareError = compareError;
exports.compareWarnings = compareWarnings;
exports.deindent = deindent;
exports.executeBundle = executeBundle;
exports.extend = extend;
exports.loader = loader;
exports.normaliseOutput = normaliseOutput;
exports.runTestSuiteWithSamples = runTestSuiteWithSamples;

function compareError(actual, expected) {
	delete actual.stack;
	actual = Object.assign({}, actual, {
		message: actual.message
	});

	if (actual.frame) {
		actual.frame = actual.frame.replace(/\s+$/gm, '');
	}

	if (expected.frame) {
		expected.frame = deindent(expected.frame);
	}

	assert.deepEqual(actual, expected);
}

function compareWarnings(actual, expected) {
	assert.deepEqual(
		actual.map(warning => {
			const clone = Object.assign({}, warning);
			delete clone.toString;

			if (clone.frame) {
				clone.frame = clone.frame.replace(/\s+$/gm, '');
			}

			return clone;
		}),
		expected.map(warning => {
			if (warning.frame) {
				warning.frame = deindent(warning.frame);
			}
			return warning;
		})
	);
}

function deindent(str) {
	return str
		.slice(1)
		.replace(/^\t+/gm, '')
		.replace(/\s+$/gm, '')
		.trim();
}

function executeBundle(bundle) {
	return bundle
		.generate({
			format: 'cjs'
		})
		.then(cjs => {
			const m = new Function('module', 'exports', cjs.code);

			const module = { exports: {} };
			m(module, module.exports);

			return module.exports;
		});
}

function extend(target) {
	[].slice.call(arguments, 1).forEach(source => {
		source &&
			Object.keys(source).forEach(key => {
				target[key] = source[key];
			});
	});

	return target;
}

function loadConfig(configFile) {
	try {
		return require(configFile);
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND') {
			const dir = path.dirname(configFile);
			removeOldTest(dir);
		} else {
			throw new Error(`Failed to load ${path}: ${err.message}`);
		}
	}
}

function removeOldTest(dir) {
	console.warn(
		`Test configuration in ${dir} not found.\nTrying to clean up no longer existing test...`
	);
	if (sander.existsSync(path.join(dir, '_actual'))) {
		sander.rimrafSync(path.join(dir, '_actual'));
	}
	if (sander.existsSync(path.join(dir, '_actual.js'))) {
		sander.unlinkSync(path.join(dir, '_actual.js'));
	}
	sander.rmdirSync(dir);
	console.warn('Directory removed.');
}

function loader(modules) {
	return {
		resolveId(id) {
			return id in modules ? id : null;
		},

		load(id) {
			return modules[id];
		}
	};
}

function normaliseOutput(code) {
	return code
		.toString()
		.trim()
		.replace(/\r\n/g, '\n');
}

function runTestSuiteWithSamples(suiteName, samplesDir, runTest, onTeardown) {
	describe(suiteName, () => runSamples(samplesDir, runTest, onTeardown));
}

// You can run only or skip certain kinds of tests be appending .only or .skip
runTestSuiteWithSamples.only = function(suiteName, samplesDir, runTest, onTeardown) {
	describe.only(suiteName, () => runSamples(samplesDir, runTest, onTeardown));
};

runTestSuiteWithSamples.skip = function(suiteName) {
	describe.skip(suiteName, () => {});
};

function runSamples(samplesDir, runTest, onTeardown) {
	if (onTeardown) {
		afterEach(onTeardown);
	}
	sander
		.readdirSync(samplesDir)
		.filter(name => name[0] !== '.')
		.sort()
		.forEach(fileName => runTestsInDir(samplesDir + '/' + fileName, runTest));
}

function runTestsInDir(dir, runTest) {
	const fileNames = sander.readdirSync(dir);

	if (fileNames.indexOf('_config.js') >= 0) {
		loadConfigAndRunTest(dir, runTest);
	} else if (fileNames.indexOf('_actual') >= 0 || fileNames.indexOf('_actual.js') >= 0) {
		removeOldTest(dir);
	} else {
		describe(path.basename(dir), () => {
			fileNames
				.filter(name => name[0] !== '.')
				.sort()
				.forEach(fileName => runTestsInDir(dir + '/' + fileName, runTest));
		});
	}
}

function loadConfigAndRunTest(dir, runTest) {
	const config = loadConfig(dir + '/_config.js');
	if (
		config &&
		(!config.minNodeVersion ||
			config.minNodeVersion <= Number(/^v(\d+)/.exec(process.version)[1])) &&
		(!config.skipIfWindows || process.platform !== 'win32')
	)
		runTest(dir, config);
}
