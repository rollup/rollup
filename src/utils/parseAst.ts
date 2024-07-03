import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './bufferToAst';
import { getAstBuffer } from './getAstBuffer';

export const parseAst: ParseAst = (input, { allowReturnOutsideFunction = false } = {}) =>
	convertProgram(getAstBuffer(parse(input, allowReturnOutsideFunction)));

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, signal } = {}
) => convertProgram(getAstBuffer(await parseAsync(input, allowReturnOutsideFunction, signal)));
