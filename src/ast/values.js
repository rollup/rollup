export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};

export const UNDEFINED_ASSIGNMENT = {
	type: 'UNDEFINED',
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNDEFINED]]'
};
