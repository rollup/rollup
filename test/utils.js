const assert = require('assert');
const path = require('path');
const fixturify = require('fixturify');
const sander = require('sander');

exports.compareError = compareError;
exports.compareWarnings = compareWarnings;
exports.deindent = deindent;
exports.executeBundle = executeBundle;
exports.getObject = getObject;
exports.loader = loader;
exports.normaliseOutput = normaliseOutput;
exports.runTestSuiteWithSamples = runTestSuiteWithSamples;
exports.assertDirectoriesAreEqual = assertDirectoriesAreEqual;
exports.assertFilesAreEqual = assertFilesAreEqual;
exports.assertIncludes = assertIncludes;

function normaliseError(error) {
	delete error.stack;
	delete error.toString;
	return { ...error, message: error.message };
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
			const clone = { ...warning };
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
	return str.slice(1).replace(/^\t+/gm, '').replace(/\s+$/gm, '').trim();
}

async function executeBundle(bundle, require) {
	const {
		output: [cjs]
	} = await bundle.generate({
		exports: 'auto',
		format: 'cjs'
	});
	const wrapper = new Function('module', 'exports', 'require', cjs.code);
	const module = { exports: {} };
	wrapper(module, module.exports, require);
	return module.exports;
}

function getObject(entries) {
	const object = {};
	for (const [key, value] of entries) {
		object[key] = value;
	}
	return object;
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
	return code.toString().trim().replace(/\r\n/g, '\n');
}

function runTestSuiteWithSamples(suiteName, samplesDir, runTest, onTeardown) {
	describe(suiteName, () => runSamples(samplesDir, runTest, onTeardown));
}

// You can run only or skip certain kinds of tests by appending .only or .skip
runTestSuiteWithSamples.only = function (suiteName, samplesDir, runTest, onTeardown) {
	describe.only(suiteName, () => runSamples(samplesDir, runTest, onTeardown));
};

runTestSuiteWithSamples.skip = function (suiteName) {
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
		.forEach(fileName => runTestsInDir(path.join(samplesDir, fileName), runTest));
}

function runTestsInDir(dir, runTest) {
	const fileNames = getFileNamesAndRemoveOutput(dir);
	if (fileNames.indexOf('_config.js') >= 0) {
		loadConfigAndRunTest(dir, runTest);
	} else if (fileNames.length === 0) {
		console.warn(`Removing empty test directory ${dir}`);
		sander.rmdirSync(dir);
	} else {
		describe(path.basename(dir), () => {
			fileNames
				.filter(name => name[0] !== '.')
				.sort()
				.forEach(fileName => runTestsInDir(path.join(dir, fileName), runTest));
		});
	}
}

function getFileNamesAndRemoveOutput(dir) {
	try {
		return sander.readdirSync(dir).filter(fileName => {
			if (fileName === '_actual') {
				sander.rimrafSync(path.join(dir, '_actual'));
				return false;
			}
			if (fileName === '_actual.js') {
				sander.unlinkSync(path.join(dir, '_actual.js'));
				return false;
			}
			return true;
		});
	} catch (error) {
		if (error.code === 'ENOTDIR') {
			throw new Error(
				`${dir} is not located next to a "_config.js" file but is not a directory or old test output either. Please inspect and consider removing the file.`
			);
		}
		throw error;
	}
}

function loadConfigAndRunTest(dir, runTest) {
	const configFile = path.join(dir, '_config.js');
	const config = require(configFile);
	if (!config || !config.description) {
		throw new Error(`Found invalid config without description: ${configFile}`);
	}
	if (
		(!config.skipIfWindows || process.platform !== 'win32') &&
		(!config.onlyWindows || process.platform === 'win32') &&
		(!config.minNodeVersion || config.minNodeVersion <= Number(/^v(\d+)/.exec(process.version)[1]))
	) {
		runTest(dir, config);
	}
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
	Object.keys({ ...actualFiles, ...expectedFiles }).forEach(fileName => {
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

function assertIncludes(actual, expected) {
	try {
		assert.ok(
			actual.includes(expected),
			`${JSON.stringify(actual)}\nincludes\n${JSON.stringify(expected)}`
		);
	} catch (err) {
		err.actual = actual;
		err.expected = expected;
		throw err;
	}
}
