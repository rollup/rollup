const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { platform, arch, report } = require('node:process');

const isMusl = () => !report.getReport().header.glibcVersionRuntime;

const bindingsByPlatformAndArch = {
	android: {
		arm: { base: 'android-arm-eabi' },
		arm64: { base: 'android-arm64' }
	},
	darwin: {
		arm64: { base: 'darwin-arm64' },
		x64: { base: 'darwin-x64' }
	},
	linux: {
		arm: { base: 'linux-arm-gnueabihf' },
		arm64: { base: 'linux-arm64-gnu', musl: 'linux-arm64-musl' },
		x64: { base: 'linux-x64-gnu', musl: 'linux-x64-musl' }
	},
	win32: {
		arm64: { base: 'win32-arm64-msvc' },
		ia32: { base: 'win32-ia32-msvc' },
		x64: { base: 'win32-x64-msvc' }
	}
};

const imported = bindingsByPlatformAndArch[platform]?.[arch];
if (!imported) {
	throw new Error(
		`Your current platform "${platform}" and architecture "${arch}" combination is not supported yet by the native Rollup build. Please use the WASM build "@rollup/wasm-node" instead. Maybe you should support Rollup to make a native build for your platform and architecture available?`
	);
}

const packageBase = imported.musl && isMusl() ? imported.musl : imported.base;
const localName = `./rollup.${packageBase}.node`;
module.exports = require(
	existsSync(join(__dirname, localName)) ? localName : `@rollup/rollup-${packageBase}`
);
