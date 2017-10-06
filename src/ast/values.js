export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindAssignmentAtPath: () => {},
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalledAtPath: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};
