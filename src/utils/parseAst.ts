import { parse, parseAsync } from '../../native';
import type {
	ast,
	ConvertAstToBuffer,
	ConvertBufferToAst,
	ParseAst,
	ParseAstAsync,
	ParseBuffer,
	ParseBufferAsync
} from '../rollup/types';
import { serializeAst } from './astToBuffer';
import { convertAst } from './bufferToAst';
import { getAstBuffer } from './getAstBuffer';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => convertAst(0, getAstBuffer(parse(input, allowReturnOutsideFunction, jsx))) as ast.Program;

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) =>
	convertAst(
		0,
		getAstBuffer(await parseAsync(input, allowReturnOutsideFunction, jsx, signal))
	) as ast.Program;

export const parseBuffer: ParseBuffer = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => parse(input, allowReturnOutsideFunction, jsx);

export const parseBufferAsync: ParseBufferAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) => parseAsync(input, allowReturnOutsideFunction, jsx, signal);

export const convertBufferToAst: ConvertBufferToAst = (buffer, position = 0) =>
	convertAst(position, getAstBuffer(buffer));

export const convertAstToBuffer: ConvertAstToBuffer = node => serializeAst(node) as Buffer;
