import type {
	ConvertAstToBuffer,
	ConvertBufferToAst,
	ParseAst,
	ParseAstAsync,
	ParseBuffer,
	ParseBufferAsync
} from '../rollup/types';

export const parseAst: ParseAst;
export const parseAstAsync: ParseAstAsync;
export const parseBuffer: ParseBuffer;
export const parseBufferAsync: ParseBufferAsync;
export const convertBufferToAst: ConvertBufferToAst;
export const convertAstToBuffer: ConvertAstToBuffer;
