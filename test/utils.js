const assert = require('assert');

exports.compareError = compareError;
exports.compareWarnings = compareWarnings;
exports.deindent = deindent;
exports.extend = extend;
exports.loadConfig = loadConfig;
exports.loader = loader;
exports.normaliseOutput = normaliseOutput;

function compareError ( actual, expected ) {
	delete actual.stack;
	actual = Object.assign( {}, actual, {
		message: actual.message
	});

	if ( actual.frame ) {
		actual.frame = actual.frame.replace( /\s+$/gm, '' );
	}

	if ( expected.frame ) {
		expected.frame = deindent( expected.frame );
	}

	assert.deepEqual( actual, expected );
}

function compareWarnings ( actual, expected ) {
	assert.deepEqual(
		actual.map( warning => {
			const clone = Object.assign( {}, warning );
			delete clone.toString;

			if ( clone.frame ) {
				clone.frame = clone.frame.replace( /\s+$/gm, '' );
			}

			return clone;
		}),
		expected.map( warning => {
			if ( warning.frame ) {
				warning.frame = deindent( warning.frame );
			}
			return warning;
		})
	);
}

function deindent(str) {
	return str.slice(1).replace(/^\t+/gm, '').replace(/\s+$/gm, '').trim();
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

function loadConfig(path) {
	try {
		return require(path);
	} catch (err) {
		console.error(err.message);
		console.error(err.stack);
		throw new Error(
			`Failed to load ${path}. An old test perhaps? You should probably delete the directory`
		);
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
	return code.toString().trim().replace(/\r\n/g, '\n');
}
