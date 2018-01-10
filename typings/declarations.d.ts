// internal
declare module "rollup";
declare module 'help.md' {
	const str: string;
	export default str;
}

declare module 'package.json' {
	const version: string;
}

// external libs
declare module "ansi-escapes";
declare module 'pretty-ms';
declare module 'rollup-plugin-buble';
declare module 'signal-exit';
declare module 'date-time';
declare module 'locate-character';
declare module 'is-reference';
declare module 'sourcemap-codec';
declare module 'require-relative';
declare module 'rollup-pluginutils/src/createFilter.js';
