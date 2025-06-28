// internal
declare module 'help.md' {
	const value: string;
	export default value;
}

// external libs
declare module 'acorn-import-assertions' {
	export const importAssertions: () => unknown;
}
