import type {
	DeserializeAst,
	DeserializeLazyAst,
	ParseAndWalk,
	ParseAst,
	ParseAstAsync,
	ParseLazyAst,
	ParseLazyAstAsync,
	SerializeAst
} from '../rollup/types';

export const parseAst: ParseAst;
export const parseAstAsync: ParseAstAsync;
export const parseLazyAst: ParseLazyAst;
export const parseLazyAstAsync: ParseLazyAstAsync;
export const deserializeLazyAst: DeserializeLazyAst;
export const deserializeAst: DeserializeAst;
export const serializeAst: SerializeAst;
export const parseAndWalk: ParseAndWalk;
