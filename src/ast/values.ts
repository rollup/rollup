import Node, { ForEachReturnExpressionCallback } from './Node';
import ExecutionPathOptions from './ExecutionPathOptions';
import CallOptions from './CallOptions';
import Variable from './variables/Variable';
import { ObjectPath } from './variables/VariableReassignmentTracker';

export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export type PredicateFunction = (node: Variable | Node | UnknownAssignment) => boolean;

export interface UnknownAssignment {
	type: string;
	reassignPath: (path: ObjectPath, options: ExecutionPathOptions) => void;
	forEachReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) => void;
	hasEffectsWhenAccessedAtPath: (path: ObjectPath, options: ExecutionPathOptions) => boolean;
	hasEffectsWhenAssignedAtPath: (path: ObjectPath, options: ExecutionPathOptions) => boolean;
	hasEffectsWhenCalledAtPath: (_path: ObjectPath, _callOptions: CallOptions, _options: ExecutionPathOptions) => true;
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
	) => boolean;
	toString: () => string;
}

export const UNKNOWN_ASSIGNMENT: UnknownAssignment = {
	type: 'UNKNOWN',
	reassignPath: (_path, _options) => {},
	forEachReturnExpressionWhenCalledAtPath: (_path, _callOptions, _callback, _options) => {},
	hasEffectsWhenAccessedAtPath: (path, _options) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path, _options) => path.length > 0,
	hasEffectsWhenCalledAtPath: (_path, _callOptions, _options) => true,
	someReturnExpressionWhenCalledAtPath: (_path, _callOptions, _callback, _options) => true,
	toString: () => '[[UNKNOWN]]'
};
