import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './convert-ast';
import getReadStringFunction from './getReadStringFunction';

export const parseAst: ParseAst = (input, { allowReturnOutsideFunction = false } = {}) => {
	const astBuffer = parse(input, allowReturnOutsideFunction);
	const readString = getReadStringFunction(astBuffer);
	const result = convertProgram(astBuffer.buffer, readString);
	return result;
};

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, signal } = {}
) => {
	const astBuffer = await parseAsync(input, allowReturnOutsideFunction, signal);
	const readString = getReadStringFunction(astBuffer);
	const result = convertProgram(astBuffer.buffer, readString);
	return result;
};
