// internal
declare module 'help.md' {
	const value: string;
	export default value;
}

// external libs
declare module 'rollup-plugin-string' {
	import type { PluginImpl } from 'rollup';

	export const string: PluginImpl;
}

declare module 'acorn-import-assertions' {
	export const importAssertions: () => unknown;
}
