import type { ast } from '../../../rollup/types';

export type VariableKind =
	| ast.VariableDeclaration['kind']
	| 'function'
	| 'class'
	| 'parameter'
	| 'other';
