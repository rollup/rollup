import { parse } from '../../native';
import type { ParseAst } from '../rollup/types';
import { convertProgram } from './convert-ast';
import getReadStringFunction from './getReadStringFunction';

export const parseAst: ParseAst = (input, { allowReturnOutsideFunction = false } = {}) => {
	const astBuffer = parse(input, allowReturnOutsideFunction);
	const readString = getReadStringFunction(astBuffer);
	return convertProgram(astBuffer.buffer, readString);
};
