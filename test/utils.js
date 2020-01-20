const assert = require('assert');
const path = require('path');
const sander = require('sander');
const fixturify = require('fixturify');

exports.compareError = compareError;
exports.compareWarnings = compareWarnings;
exports.deindent = deindent;
exports.executeBundle = executeBundle;
exports.extend = extend;
exports.loader = loader;
exports.normaliseOutput = normaliseOutput;
exports.runTestSuiteWithSamples = runTestSuiteWithSamples;
exports.assertDirectoriesAreEqual = assertDirectoriesAreEqual;
exports.assertStderrIncludes = assertStderrIncludes;

function normaliseError(error) {
	delete error.stack;
	return Object.assign({}, error, {
		message: error.message
	});
}

function compareError(actual, expected) {
	actual = normaliseError(actual);

	if (actual.parserError) {
		actual.parserError = normaliseError(actual.parserError);
	}

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

function executeBundle(bundle, require) {
	return bundle
		.generate({
			format: 'cjs'
		})
		.then(({ output: [cjs] }) => {
			const m = new Function('module', 'exports', 'require', cjs.code);

			const module = { exports: {} };
			m(module, module.exports, require);

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

function removeOldOutput(dir) {
	if (sander.existsSync(path.join(dir, '_actual'))) {
		sander.rimrafSync(path.join(dir, '_actual'));
	}
	if (sander.existsSync(path.join(dir, '_actual.js'))) {
		sander.unlinkSync(path.join(dir, '_actual.js'));
	}
}

function removeOldTest(dir) {
	removeOldOutput(dir);
	console.warn(
		`Test configuration in ${dir} not found.\nTrying to clean up no longer existing test...`
	);
	sander.rmdirSync(dir);
	console.warn('Directory removed.');
}

function loader(modules) {
	modules = Object.assign(Object.create(null), modules);
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
		removeOldOutput(dir);
		loadConfigAndRunTest(dir, runTest);
	} else if (fileNames.indexOf('_actual') >= 0 || fileNames.indexOf('_actual.js') >= 0) {
		removeOldOutput(dir);
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
	if (config && (!config.skipIfWindows || process.platform !== 'win32')) runTest(dir, config);
}

function assertDirectoriesAreEqual(actualDir, expectedDir) {
	const actualFiles = fixturify.readSync(actualDir);

	let expectedFiles;
	try {
		expectedFiles = fixturify.readSync(expectedDir);
	} catch (err) {
		expectedFiles = [];
	}
	assertFilesAreEqual(actualFiles, expectedFiles);
}

function assertFilesAreEqual(actualFiles, expectedFiles, dirs = []) {
	Object.keys(Object.assign({}, actualFiles, expectedFiles)).forEach(fileName => {
		const pathSegments = dirs.concat(fileName);
		if (typeof actualFiles[fileName] === 'object' && typeof expectedFiles[fileName] === 'object') {
			return assertFilesAreEqual(actualFiles[fileName], expectedFiles[fileName], pathSegments);
		}

		const shortName = pathSegments.join('/');
		assert.strictEqual(
			`${shortName}: ${actualFiles[fileName]}`,
			`${shortName}: ${expectedFiles[fileName]}`
		);
	});
}

function assertStderrIncludes(stderr, expected) {
	try {
		assert.ok(
			stderr.includes(expected),
			`Could not find ${JSON.stringify(expected)} in ${JSON.stringify(stderr)}`
		);
	} catch (err) {
		err.actual = stderr;
		err.expected = expected;
		throw err;
	}
}
