import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './bufferToAst';
import getReadStringFunction from './getReadStringFunction';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, typescript = false } = {}
) => {
	const astBuffer = parse(input, allowReturnOutsideFunction, typescript);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, typescript = false, signal } = {}
) => {
	const astBuffer = await parseAsync(input, allowReturnOutsideFunction, typescript, signal);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};
