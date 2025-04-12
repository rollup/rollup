export const enum Flag {
	included = 1 << 0,
	deoptimized = 1 << 1,
	tdzAccessDefined = 1 << 2,
	tdzAccess = 1 << 3,
	assignmentDeoptimized = 1 << 4,
	bound = 1 << 5,
	isUndefined = 1 << 6,
	optional = 1 << 7,
	async = 1 << 8,
	deoptimizedReturn = 1 << 9,
	computed = 1 << 10,
	hasLostTrack = 1 << 11,
	hasUnknownDeoptimizedInteger = 1 << 12,
	hasUnknownDeoptimizedProperty = 1 << 13,
	directlyIncluded = 1 << 14,
	deoptimizeBody = 1 << 15,
	isBranchResolutionAnalysed = 1 << 16,
	await = 1 << 17,
	method = 1 << 18,
	shorthand = 1 << 19,
	tail = 1 << 20,
	prefix = 1 << 21,
	generator = 1 << 22,
	expression = 1 << 23,
	destructuringDeoptimized = 1 << 24,
	hasDeoptimizedCache = 1 << 25,
	hasEffects = 1 << 26,
	isTopLevelAwait = 1 << 27,
	withinTopLevelAwait = 1 << 28,
	checkedForWarnings = 1 << 29
}

export function isFlagSet(flags: number, flag: Flag): boolean {
	return (flags & flag) !== 0;
}

export function setFlag(flags: number, flag: Flag, value: boolean): number {
	return (flags & ~flag) | (-value & flag);
}
