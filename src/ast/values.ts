import Node from './Node';
import ExecutionPathOptions from './ExecutionPathOptions';
import CallOptions from './CallOptions';

export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export type PredicateFunction = (node: Node | UnknownAssignment) => boolean;

export interface UnknownAssignment extends Node {
	type: 'UNKNOWN';
};

export interface UndefinedAssignment extends Node {
	type: 'UNDEFINED';
};

export const UNKNOWN_ASSIGNMENT: UnknownAssignment = {
	type: 'UNKNOWN',
	reassignPath: () => { },
	forEachReturnExpressionWhenCalledAtPath: () => { },
	hasEffectsWhenAccessedAtPath: (path: string[], _options: ExecutionPathOptions) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path: string[], _options: ExecutionPathOptions) => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};

export const UNDEFINED_ASSIGNMENT: UndefinedAssignment = {
	type: 'UNDEFINED',
	reassignPath: () => { },
	forEachReturnExpressionWhenCalledAtPath: () => { },
	hasEffectsWhenAccessedAtPath: (path: string[], _options: ExecutionPathOptions) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path: string[], _options: ExecutionPathOptions) => path.length > 0,
	hasEffectsWhenCalledAtPath: (_path: string[], _callOptions: CallOptions, _options: ExecutionPathOptions) => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNDEFINED]]'
};
