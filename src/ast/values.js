export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNDEFINED_ASSIGNMENT = {
	type: 'UNDEFINED',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};

export const UNKNOWN_OBJECT_LITERAL = {
	type: 'UNKNOWN_OBJECT_LITERAL',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutatedAtPath: path => path.length > 0,
};
