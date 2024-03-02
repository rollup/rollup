import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './bufferToAst';
import getReadStringFunction from './getReadStringFunction';

export const parseAst: ParseAst = (
	input,
	{ allowReturnOutsideFunction = false, preserveTypescript = false } = {}
) => {
	const astBuffer = parse(input, allowReturnOutsideFunction, preserveTypescript);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, preserveTypescript = false, signal } = {}
) => {
	const astBuffer = await parseAsync(input, allowReturnOutsideFunction, preserveTypescript, signal);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};
