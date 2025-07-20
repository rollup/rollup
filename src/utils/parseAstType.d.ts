import type {
	ConvertAstToBuffer,
	ConvertBufferToAst,
	ParseAst,
	ParseAstAsync
} from '../rollup/types';

export const parseAst: ParseAst;
export const parseAstAsync: ParseAstAsync;
export const convertBufferToAst: ConvertBufferToAst;
export const convertAstToBuffer: ConvertAstToBuffer;
