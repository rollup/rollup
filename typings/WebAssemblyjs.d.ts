declare module '@webassemblyjs/ast' {
	export type Program = object;
	export function traverse(Program, object);
}

declare module '@webassemblyjs/wasm-parser' {
	export function decode(Buffer, object): Program;
}
