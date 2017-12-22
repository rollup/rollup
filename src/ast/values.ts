import Node from './Node';
import ExecutionPathOptions from './ExecutionPathOptions';
import CallOptions from './CallOptions';

export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export type PredicateFunction = (node: Node | UnknownAssignment | UndefinedAssignment) => boolean;

export interface UnknownAssignment {
	type: 'UNKNOWN';
	reassignPath: () => void;
	forEachReturnExpressionWhenCalledAtPath: () => void;
	hasEffectsWhenAccessedAtPath: (path: string[], _options: ExecutionPathOptions) => boolean;
	hasEffectsWhenAssignedAtPath: (path: string[], _options: ExecutionPathOptions) => boolean;
	hasEffectsWhenCalledAtPath: () => true;
	someReturnExpressionWhenCalledAtPath: () => true;
	toString: () => '[[UNKNOWN]]';
};

export interface UndefinedAssignment {
	type: 'UNDEFINED';
	reassignPath: () => void;
	forEachReturnExpressionWhenCalledAtPath: () => void;
	hasEffectsWhenAccessedAtPath: (path: string[], _options: ExecutionPathOptions) => boolean;
	hasEffectsWhenAssignedAtPath: (path: string[], _options: ExecutionPathOptions) => boolean;
	hasEffectsWhenCalledAtPath: (_path: string[], _callOptions: CallOptions, _options: ExecutionPathOptions) => true;
	someReturnExpressionWhenCalledAtPath: () => true;
	toString: () => '[[UNDEFINED]]';
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
