import type { AstNode, ParseAst } from '../../src/rollup/types';
import { parseAst } from '../../src/utils/parseAst';

// We could also do things in a web worker here, but that would make bundling
// the browser build much more complicated
const parseAstAsync = async (
	code: Parameters<ParseAst>[0],
	options?: Parameters<ParseAst>[1]
): Promise<AstNode> => new Promise(resolve => resolve(parseAst(code, options)));

export const getParseAstAsync = () => parseAstAsync;
