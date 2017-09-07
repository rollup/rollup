export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutated: () => true,
};

export const UNDEFINED_ASSIGNMENT = {
	type: 'UNDEFINED',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutated: () => true,
};

export const UNKNOWN_OBJECT_LITERAL = {
	type: 'UNKNOWN_OBJECT_LITERAL',
	bindCall: () => {},
	hasEffectsWhenCalled: () => true,
	hasEffectsWhenMutated: () => false,
};
