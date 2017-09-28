export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_ASSIGNMENT = {
	type: 'UNKNOWN',
	bindAssignmentAtPath: () => {},
	bindCallAtPath: () => {},
	hasEffectsWhenAssignedAtPath: () => true,
	hasEffectsWhenCalledAtPath: () => true,
	hasEffectsWhenMutatedAtPath: () => true,
};
