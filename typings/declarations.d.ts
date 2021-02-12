// internal
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

declare module 'fsevents' {
	export default {};
}

declare module 'acorn-walk' {
	type WalkerCallback<TState> = (node: acorn.Node, state: TState) => void;
	type RecursiveWalkerFn<TState> = (
		node: acorn.Node,
		state: TState,
		callback: WalkerCallback<TState>
	) => void;
	export type BaseWalker<TState> = Record<string, RecursiveWalkerFn<TState>>;
	export const base: BaseWalker<unknown>
}
