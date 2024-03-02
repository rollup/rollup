import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './bufferToAst';
import { getAstBuffer } from './getAstBuffer';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, jsx = false } = {}
) => convertProgram(getAstBuffer(parse(input, allowReturnOutsideFunction, jsx)));

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, jsx = false, signal } = {}
) => convertProgram(getAstBuffer(await parseAsync(input, allowReturnOutsideFunction, jsx, signal)));
