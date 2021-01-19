// internal
declare module 'rollup';
declare module 'help.md' {
	const str: string;
	export default str;
}

// external libs
declare module 'acorn-static-class-features' {
	const plugin: (BaseParser: typeof acorn.Parser) => typeof acorn.Parser;
	export default plugin;
}

declare module 'acorn-class-fields' {
	const plugin: (BaseParser: typeof acorn.Parser) => typeof acorn.Parser;
	export default plugin;
}

declare module 'acorn-import-meta' {
	const plugin: (BaseParser: typeof acorn.Parser) => typeof acorn.Parser;
	export default plugin;
}

declare module 'acorn-export-ns-from' {
	const plugin: (BaseParser: typeof acorn.Parser) => typeof acorn.Parser;
	export default plugin;
}

declare module 'fsevents' {
	export default {};
}
