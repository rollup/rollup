import { parse, parseAsync } from '../../native';
import type {
	ast,
	ConvertAstToBuffer,
	ConvertBufferToAst,
	ParseAst,
	ParseAstAsync
} from '../rollup/types';
import { serializeAst } from './astToBuffer';
import { deserializeAst } from './bufferToAst';
import { getAstBuffer } from './getAstBuffer';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => deserializeAst(0, getAstBuffer(parse(input, allowReturnOutsideFunction, jsx))) as ast.Program;

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) =>
	deserializeAst(
		0,
		getAstBuffer(await parseAsync(input, allowReturnOutsideFunction, jsx, signal))
	) as ast.Program;

export const convertBufferToAst: ConvertBufferToAst = (buffer, position = 0) =>
	deserializeAst(position, getAstBuffer(buffer));

export const convertAstToBuffer: ConvertAstToBuffer = node => serializeAst(node) as Buffer;
