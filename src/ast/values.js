export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindCallAtPath: () => {},
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalledAtPath: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNDEFINED_ASSIGNMENT = {
	type: 'UNDEFINED',
	bindCallAtPath: () => {},
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalledAtPath: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNKNOWN_OBJECT_LITERAL = {
	type: 'UNKNOWN_OBJECT_LITERAL',
	bindCallAtPath: () => {},
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: () => true,
	hasEffectsWhenMutatedAtPath: path => path.length > 0,
};
