export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export interface UnknownAssignment {
	type: 'UNKNOWN';
	reassignPath: () => void;
	forEachReturnExpressionWhenCalledAtPath: () => void;
	hasEffectsWhenAccessedAtPath: (path: string[]) => boolean;
	hasEffectsWhenAssignedAtPath: (path: string[]) => boolean;
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};

export interface UndefinedAssignment {
	type: 'UNDEFINED';
	reassignPath: () => void,
	forEachReturnExpressionWhenCalledAtPath: () => void,
	hasEffectsWhenAccessedAtPath: (path: string[]) => boolean;
	hasEffectsWhenAssignedAtPath: (path: string[]) => boolean;
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNDEFINED]]'
};

export const UNKNOWN_ASSIGNMENT: UnknownAssignment = {
	type: 'UNKNOWN',
	reassignPath: () => { },
	forEachReturnExpressionWhenCalledAtPath: () => { },
	hasEffectsWhenAccessedAtPath: (path: string[]) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path: string[]) => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};

export const UNDEFINED_ASSIGNMENT: UndefinedAssignment = {
	type: 'UNDEFINED',
	reassignPath: () => { },
	forEachReturnExpressionWhenCalledAtPath: () => { },
	hasEffectsWhenAccessedAtPath: (path: string[]) => path.length > 0,
	hasEffectsWhenAssignedAtPath: (path: string[]) => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNDEFINED]]'
};
