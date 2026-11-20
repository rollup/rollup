import { parse, parseAsync } from '../../native';
import type {
	ast,
	DeserializeAst,
	DeserializeLazyAst,
	ParseAst,
	ParseAstAsync,
	ParseLazyAst,
	ParseLazyAstAsync
} from '../rollup/types';
import { deserializeAstBuffer } from './bufferToAst';
import { deserializeLazyAstBuffer } from './bufferToLazyAst';
import { getAstBuffer } from './getAstBuffer';

export { serializeAst } from './astToBuffer';
export { parseAndWalk } from './parseAndWalk';

export const deserializeAst: DeserializeAst = (buffer, position = 0) =>
	deserializeAstBuffer(getAstBuffer(buffer), position);

export const deserializeLazyAst: DeserializeLazyAst = (buffer, position = 0) =>
	deserializeLazyAstBuffer(getAstBuffer(buffer), position);

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeAst(parse(input, allowReturnOutsideFunction, jsx)) as ast.Program;

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeAst(await parseAsync(input, allowReturnOutsideFunction, jsx)) as ast.Program;

export const parseLazyAst: ParseLazyAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeLazyAst(parse(input, allowReturnOutsideFunction, jsx)) as ast.LazyNode<ast.Program>;

export const parseLazyAstAsync: ParseLazyAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) =>
	deserializeLazyAst(
		await parseAsync(input, allowReturnOutsideFunction, jsx)
	) as ast.LazyNode<ast.Program>;
