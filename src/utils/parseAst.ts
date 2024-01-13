import { parse, parseAsync } from '../../native';
import type { ParseAst, ParseAstAsync } from '../rollup/types';
import { convertProgram } from './buffer-to-ast';
import getReadStringFunction from './getReadStringFunction';

export const parseAst: ParseAst = (input, { allowReturnOutsideFunction = false } = {}) => {
	const astBuffer = parse(input, allowReturnOutsideFunction);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};

export const parseAstAsync: ParseAstAsync = async (
	input,
	{ allowReturnOutsideFunction = false, signal } = {}
) => {
	const astBuffer = await parseAsync(input, allowReturnOutsideFunction, signal);
	return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
};
