const path = require('path');
const fs = require('fs');
const rollup = require('../dist/rollup.js');

exports.targetDir = path.resolve(__dirname, '..', 'perf');
const configFile = path.resolve(exports.targetDir, 'rollup.config.js');

try {
	fs.accessSync(configFile, fs.constants.R_OK);
} catch (e) {
	console.error(`No valid "rollup.config.js" in ${exports.targetDir}. Did you "npm run perf:init"?`);
	process.exit(1);
}

exports.loadPerfConfig = async () => {
	const bundle = await rollup.rollup({
		input: configFile,
		external: id => (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		onwarn: warning => console.error(warning.message)
	});
	const configs = loadConfigFromCode((await bundle.generate({ format: 'cjs' })).code);
	return Array.isArray(configs) ? configs[0] : configs;
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
