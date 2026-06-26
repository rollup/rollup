import { parse, parseAsync } from '../../native';
import type { ast, ParseAst, ParseAstAsync } from '../rollup/types';
import { deserializeAst } from './bufferToAst';
import { deserializeLazyAst } from './bufferToLazyAst';

export { serializeAst } from './astToBuffer';
export { deserializeAst } from './bufferToAst';
export { deserializeLazyAst } from './bufferToLazyAst';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeAst(parse(input, allowReturnOutsideFunction, jsx)) as ast.Program;

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) =>
	deserializeAst(await parseAsync(input, allowReturnOutsideFunction, jsx, signal)) as ast.Program;

export const parseLazyAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeLazyAst(parse(input, allowReturnOutsideFunction, jsx)) as ast.Program;

export const parseLazyAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) =>
	deserializeLazyAst(
		await parseAsync(input, allowReturnOutsideFunction, jsx, signal)
	) as ast.Program;
