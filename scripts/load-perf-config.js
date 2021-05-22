const fs = require('fs');
const path = require('path');
const rollup = require('../dist/rollup.js');

exports.targetDir = path.resolve(__dirname, '..', 'perf');
const configFile = path.resolve(exports.targetDir, 'rollup.config.js');

try {
	fs.accessSync(configFile, fs.constants.R_OK);
} catch (e) {
	console.error(
		`No valid "rollup.config.js" in ${exports.targetDir}. Did you "npm run perf:init"?`
	);
	process.exit(1);
}

exports.loadPerfConfig = async () => {
	const bundle = await rollup.rollup({
		external: id => (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		input: configFile,
		onwarn: warning => console.error(warning.message)
	});
	let config = loadConfigFromCode((await bundle.generate({ format: 'cjs' })).output[0].code);
	config = typeof config === 'function' ? config({}) : config;
	return Array.isArray(config) ? config[0] : config;
};

function loadConfigFromCode(code) {
	const defaultLoader = require.extensions['.js'];
	require.extensions['.js'] = (module, filename) => {
		if (filename === configFile) {
			module._compile(code, filename);
		} else {
			defaultLoader(module, filename);
		}
	};
	delete require.cache[configFile];
	return require(configFile);
}
