/**
 * @typedef {import('../src/rollup/types').RollupError} RollupError
 * @typedef {import('../src/rollup/types').RollupWarning} RollupWarning
 * @typedef {import('../src/rollup/types').Plugin} Plugin
 * @typedef {import('./types').TestConfigBase} TestConfigBase
 */

const assert = require('node:assert');
const {
	closeSync,
	fsyncSync,
	openSync,
	readdirSync,
	renameSync,
	unlinkSync,
	rmSync,
	writeFileSync,
	writeSync
} = require('node:fs');
const { basename, join } = require('node:path');
const { platform, version } = require('node:process');
const fixturify = require('fixturify');

if (!globalThis.defineTest) {
	globalThis.defineTest = config => config;
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
exports.wait = function wait(ms) {
	return new Promise(fulfil => {
		setTimeout(fulfil, ms);
	});
};

function normaliseError(error) {
	const clone = { ...error, message: error.message };
	delete clone.stack;
	delete clone.toString;
	if (clone.watchFiles) {
		clone.watchFiles.sort();
	}
	if (clone.frame) {
		clone.frame = clone.frame.replace(/\s+$/gm, '');
	}
	if (clone.cause) {
		clone.cause = normaliseError(clone.cause);
	}
	return clone;
}

/**
 * @param {RollupError} actual
 * @param {RollupError} expected
 */
exports.compareError = function compareError(actual, expected) {
	actual = normaliseError(actual);
	if (expected.frame) {
		expected.frame = deindent(expected.frame);
	}
	assert.deepEqual(actual, expected);
};

/**
 * @param {RollupWarning[]} actual
 * @param {RollupWarning[]} expected
 */
exports.compareWarnings = function compareWarnings(actual, expected) {
	assert.deepEqual(
		actual.map(normaliseError).sort(sortWarnings),
		expected
			.map(warning => {
				if (warning.frame) {
					warning.frame = deindent(warning.frame);
				}
				return warning;
			})
			.sort(sortWarnings)
	);
};

/**
 * @param {RollupWarning} a
 * @param {RollupWarning} b
 */
function sortWarnings(a, b) {
	return a.message === b.message ? 0 : a.message < b.message ? -1 : 1;
}

/**
 * @param {string} stringValue
 */
function deindent(stringValue) {
	return stringValue.slice(1).replace(/^\t+/gm, '').replace(/\s+$/gm, '').trim();
}

exports.deindent = deindent;

exports.executeBundle = async function executeBundle(bundle, require) {
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
};

/**
 * @param {Iterable<[string, any]>} entries
 * @returns {Record<string, any>}
 */
exports.getObject = function getObject(entries) {
	const object = {};
	for (const [key, value] of entries) {
		object[key] = value;
	}
	return object;
};

/**
 * @param {Record<string, string>} modules
 * @returns {Plugin}
 */
exports.loader = function loader(modules) {
	modules = Object.assign(Object.create(null), modules);
	return {
		name: 'test-plugin-loader',
		resolveId(id) {
			return id in modules ? id : null;
		},
		load(id) {
			return modules[id];
		}
	};
};

exports.normaliseOutput = function normaliseOutput(code) {
	return code.toString().trim().replace(/\r\n/g, '\n');
};

/**
 * @template {TestConfigBase} C
 * @param {string} suiteName
 * @param {string} samplesDirectory
 * @param {(directory: string, config: C) => void} runTest
 * @param {() => void | Promise<void>} [onTeardown]
 */
function runTestSuiteWithSamples(suiteName, samplesDirectory, runTest, onTeardown) {
	describe(suiteName, () => runSamples(samplesDirectory, runTest, onTeardown));
}

// You can run only or skip certain kinds of tests by appending .only or .skip
/**
 * @template {TestConfigBase} C
 * @param {string} suiteName
 * @param {string} samplesDirectory
 * @param {(directory: string, config: C) => void} runTest
 * @param {() => void | Promise<void>} onTeardown
 */
runTestSuiteWithSamples.only = function (suiteName, samplesDirectory, runTest, onTeardown) {
	describe.only(suiteName, () => runSamples(samplesDirectory, runTest, onTeardown));
};

/**
 * @param {string} suiteName
 */
runTestSuiteWithSamples.skip = function (suiteName) {
	describe.skip(suiteName, () => {});
};

exports.runTestSuiteWithSamples = runTestSuiteWithSamples;

/**
 * @template {TestConfigBase} C
 * @param {string} samplesDirectory
 * @param {(directory: string, config: C) => void} runTest
 * @param {Mocha.Func} onTeardown
 */
function runSamples(samplesDirectory, runTest, onTeardown) {
	if (onTeardown) {
		afterEach(onTeardown);
	}

	for (const fileName of readdirSync(samplesDirectory)
		.filter(name => name[0] !== '.')
		.sort()) {
		runTestsInDirectory(join(samplesDirectory, fileName), runTest);
	}
}

/**
 * @template {TestConfigBase} C
 * @param {string} directory
 * @param {(directory: string, config: C) => void} runTest
 */
function runTestsInDirectory(directory, runTest) {
	const fileNames = getFileNamesAndRemoveOutput(directory);
	if (fileNames.includes('_config.js')) {
		loadConfigAndRunTest(directory, runTest);
	} else if (fileNames.length === 0) {
		console.warn(`Removing empty test directory ${directory}`);
		rmSync(directory, {
			force: true,
			recursive: true
		});
	} else {
		describe(basename(directory), () => {
			for (const fileName of fileNames.filter(name => name[0] !== '.').sort()) {
				runTestsInDirectory(join(directory, fileName), runTest);
			}
		});
	}
}

/**
 * @param {string} directory
 */
function getFileNamesAndRemoveOutput(directory) {
	try {
		return readdirSync(directory).filter(fileName => {
			if (fileName === '_actual') {
				rmSync(join(directory, '_actual'), {
					force: true,
					recursive: true
				});
				return false;
			}
			if (fileName === '_actual.js') {
				unlinkSync(join(directory, '_actual.js'));
				return false;
			}
			return true;
		});
	} catch (error) {
		if (error.code === 'ENOTDIR') {
			throw new Error(
				`${directory} is not located next to a "_config.js" file but is not a directory or old test output either. Please inspect and consider removing the file.`
			);
		}
		throw error;
	}
}

exports.getFileNamesAndRemoveOutput = getFileNamesAndRemoveOutput;

/**
 * @template {TestConfigBase} C
 * @param {string} directory
 * @param {(directory: string, config: C) => void} runTest
 */
function loadConfigAndRunTest(directory, runTest) {
	const configFile = join(directory, '_config.js');
	const config = require(configFile);
	if (!config || !config.description) {
		throw new Error(`Found invalid config without description: ${configFile}`);
	}
	if (
		(!config.skipIfWindows || platform !== 'win32') &&
		(!config.onlyWindows || platform === 'win32') &&
		(!config.minNodeVersion || config.minNodeVersion <= Number(/^v(\d+)/.exec(version)[1]))
	) {
		runTest(directory, config);
	}
}

/**
 * @param {string} actualDirectory
 * @param {string} expectedDirectory
 */
exports.assertDirectoriesAreEqual = function assertDirectoriesAreEqual(
	actualDirectory,
	expectedDirectory
) {
	const actualFiles = fixturify.readSync(actualDirectory);

	let expectedFiles;
	try {
		expectedFiles = fixturify.readSync(expectedDirectory);
	} catch {
		expectedFiles = [];
	}
	assertFilesAreEqual(actualFiles, expectedFiles);
};

function assertFilesAreEqual(actualFiles, expectedFiles, directories = []) {
	for (const fileName of Object.keys({ ...actualFiles, ...expectedFiles })) {
		const pathSegments = [...directories, fileName];
		if (typeof actualFiles[fileName] === 'object' && typeof expectedFiles[fileName] === 'object') {
			assertFilesAreEqual(actualFiles[fileName], expectedFiles[fileName], pathSegments);
			continue;
		}

		const shortName = pathSegments.join('/');
		assert.strictEqual(
			`${shortName}: ${actualFiles[fileName]}`,
			`${shortName}: ${expectedFiles[fileName]}`
		);
	}
}

exports.assertFilesAreEqual = assertFilesAreEqual;

/**
 * @param {string} actual
 * @param {string} expected
 */
exports.assertIncludes = function assertIncludes(actual, expected) {
	try {
		assert.ok(
			actual.includes(expected),
			`${JSON.stringify(actual)}\nshould include\n${JSON.stringify(expected)}`
		);
	} catch (error) {
		error.actual = actual;
		error.expected = expected;
		throw error;
	}
};

/**
 * @param {string} actual
 * @param {string} expected
 */
exports.assertDoesNotInclude = function assertDoesNotInclude(actual, expected) {
	try {
		assert.ok(
			!actual.includes(expected),
			`${JSON.stringify(actual)}\nshould not include\n${JSON.stringify(expected)}`
		);
	} catch (error) {
		error.actual = actual;
		error.expected = expected;
		throw error;
	}
};

/**
 * Workaround a race condition in fs.writeFileSync that temporarily creates
 * an empty file for a brief moment which may be read by rollup watch - even
 * if the content being overwritten is identical.
 *
 * @param {string} filePath
 * @param {string} contents
 */
function atomicWriteFileSync(filePath, contents) {
	const stagingPath = filePath + '_';
	writeFileSync(stagingPath, contents);
	renameSync(stagingPath, filePath);
}

exports.atomicWriteFileSync = atomicWriteFileSync;

/**
 * It appears that on macOS, it sometimes takes long for the file system to update
 *
 * @param {string} filePath
 * @param {string} contents
 */
exports.writeAndSync = function writeAndSync(filePath, contents) {
	const file = openSync(filePath, 'w');
	writeSync(file, contents);
	fsyncSync(file);
	closeSync(file);
};

/**
 * Sometimes, watchers on macOS do not seem to fire. In those cases, it helps
 * to write the same content again. This function returns a callback to stop
 * further updates.
 *
 * @param {string} filePath
 * @param {string} contents
 */
exports.writeAndRetry = function writeAndRetry(filePath, contents) {
	let retries = 0;
	let updateRetryTimeout;

	const writeFile = () => {
		if (retries > 0) {
			console.error(`RETRIED writeFile (${retries})`);
		}
		retries++;
		atomicWriteFileSync(filePath, contents);
		updateRetryTimeout = setTimeout(writeFile, 1000);
	};

	writeFile();
	return () => clearTimeout(updateRetryTimeout);
};

/**
 * @param {any} object
 * @param {any} replaced
 */
exports.replaceDirectoryInStringifiedObject = function replaceDirectoryInStringifiedObject(
	object,
	replaced
) {
	return JSON.stringify(object, null, 2).replace(
		new RegExp(
			JSON.stringify(JSON.stringify(replaced).slice(1, -1)).slice(1, -1) + '[/\\\\]*',
			'g'
		),
		'**/'
	);
};
