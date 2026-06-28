import type {
	DeserializeAst,
	ParseAndWalk,
	ParseAst,
	ParseAstAsync,
	SerializeAst
} from '../rollup/types';

export const parseAst: ParseAst;
export const parseAstAsync: ParseAstAsync;
export const parseLazyAst: ParseAst;
export const parseLazyAstAsync: ParseAstAsync;
export const deserializeLazyAst: DeserializeAst;
export const deserializeAst: DeserializeAst;
export const serializeAst: SerializeAst;
export const parseAndWalk: ParseAndWalk;
