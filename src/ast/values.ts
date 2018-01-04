import { Expression } from './nodes/shared/Expression';

export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_EXPRESSION: Expression = {
	reassignPath: (_path, _options) => {},
	forEachReturnExpressionWhenCalledAtPath: (_path, _callOptions, _callback, _options) => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: (path, _options) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path, _options) => path.length > 0,
	hasEffectsWhenCalledAtPath: (_path, _callOptions, _options) => true,
	someReturnExpressionWhenCalledAtPath: (_path, _callOptions, _callback, _options) => true,
	toString: () => '[[UNKNOWN]]'
};
