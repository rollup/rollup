export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindCall: () => {},
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNDEFINED_ASSIGNMENT = {
	type: 'UNDEFINED',
	bindCall: () => {},
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNKNOWN_OBJECT_LITERAL = {
	type: 'UNKNOWN_OBJECT_LITERAL',
	bindCall: () => {},
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: path => path.length > 0,
};
