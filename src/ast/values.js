export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	hasEffectsWhenMutated: () => true,
};
