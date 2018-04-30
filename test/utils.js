const assert = require('assert');
const path = require('path');
const sander = require('sander');

exports.compareError = compareError;
exports.compareWarnings = compareWarnings;
exports.deindent = deindent;
exports.executeBundle = executeBundle;
exports.extend = extend;
exports.loadConfig = loadConfig;
exports.loader = loader;
exports.normaliseOutput = normaliseOutput;
exports.removeOldTest = removeOldTest;

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

function removeOldTest(dir) {
	console.warn(
		`Test configuration in ${dir} not found.\nTrying to clean up no longer existing test...`
	);
	sander.rimrafSync(path.join(dir, '_actual'));
	sander.rmdirSync(dir);
	console.warn('Directory removed.');
}
