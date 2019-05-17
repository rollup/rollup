import CallOptions from './CallOptions';
import { ExecutionPathOptions } from './ExecutionPathOptions';
import { LiteralValue } from './nodes/Literal';
import { ExpressionEntity } from './nodes/shared/Expression';

export interface UnknownKey {
	UNKNOWN_KEY: true;
}
export const UNKNOWN_KEY: UnknownKey = { UNKNOWN_KEY: true };

export type ObjectPathKey = string | UnknownKey;
export type ObjectPath = ObjectPathKey[];
export const EMPTY_PATH: ObjectPath = [];
export const UNKNOWN_PATH: ObjectPath = [UNKNOWN_KEY];

export interface MemberDescription {
	callsArgs: number[] | null;
	mutatesSelf: boolean;
	returns: { new (): ExpressionEntity } | null;
	returnsPrimitive: ExpressionEntity | null;
}

export interface MemberDescriptions {
	[key: string]: MemberDescription;
}

interface RawMemberDescription {
	value: MemberDescription;
}

function assembleMemberDescriptions(
	memberDescriptions: { [key: string]: RawMemberDescription },
	inheritedDescriptions: MemberDescriptions | null = null
): MemberDescriptions {
	return Object.create(inheritedDescriptions, memberDescriptions);
}

export interface UnknownValue {
	UNKNOWN_VALUE: true;
}
export const UNKNOWN_VALUE: UnknownValue = { UNKNOWN_VALUE: true };
export type LiteralValueOrUnknown = LiteralValue | UnknownValue;

export const UNKNOWN_EXPRESSION: ExpressionEntity = {
	deoptimizePath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	getReturnExpressionWhenCalledAtPath: () => UNKNOWN_EXPRESSION,
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	include: () => {},
	included: true,
	toString: () => '[[UNKNOWN]]'
};
export const UNDEFINED_EXPRESSION: ExpressionEntity = {
	deoptimizePath: () => {},
	getLiteralValueAtPath: () => undefined,
	getReturnExpressionWhenCalledAtPath: () => UNKNOWN_EXPRESSION,
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	include: () => {},
	included: true,
	toString: () => 'undefined'
};
const returnsUnknown: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_EXPRESSION
	}
};
const mutatesSelfReturnsUnknown: RawMemberDescription = {
	value: { returns: null, returnsPrimitive: UNKNOWN_EXPRESSION, callsArgs: null, mutatesSelf: true }
};
const callsArgReturnsUnknown: RawMemberDescription = {
	value: { returns: null, returnsPrimitive: UNKNOWN_EXPRESSION, callsArgs: [0], mutatesSelf: false }
};

export class UnknownArrayExpression implements ExpressionEntity {
	included = false;

	deoptimizePath() {}

	getLiteralValueAtPath() {
		return UNKNOWN_VALUE;
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(arrayMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], this.included, callOptions, options);
		}
		return true;
	}

	include() {
		this.included = true;
	}

	toString() {
		return '[[UNKNOWN ARRAY]]';
	}
}

const returnsArray: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: UnknownArrayExpression,
		returnsPrimitive: null
	}
};
const mutatesSelfReturnsArray: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: true,
		returns: UnknownArrayExpression,
		returnsPrimitive: null
	}
};
const callsArgReturnsArray: RawMemberDescription = {
	value: {
		callsArgs: [0],
		mutatesSelf: false,
		returns: UnknownArrayExpression,
		returnsPrimitive: null
	}
};
const callsArgMutatesSelfReturnsArray: RawMemberDescription = {
	value: {
		callsArgs: [0],
		mutatesSelf: true,
		returns: UnknownArrayExpression,
		returnsPrimitive: null
	}
};

const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity = {
	deoptimizePath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	getReturnExpressionWhenCalledAtPath: path => {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalBooleanMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	},
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalBooleanMembers[subPath];
		}
		return true;
	},
	include: () => {},
	included: true,
	toString: () => '[[UNKNOWN BOOLEAN]]'
};

const returnsBoolean: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_BOOLEAN
	}
};
const callsArgReturnsBoolean: RawMemberDescription = {
	value: {
		callsArgs: [0],
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_BOOLEAN
	}
};

const UNKNOWN_LITERAL_NUMBER: ExpressionEntity = {
	deoptimizePath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	getReturnExpressionWhenCalledAtPath: path => {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalNumberMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	},
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalNumberMembers[subPath];
		}
		return true;
	},
	include: () => {},
	included: true,
	toString: () => '[[UNKNOWN NUMBER]]'
};

const returnsNumber: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_NUMBER
	}
};
const mutatesSelfReturnsNumber: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: true,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_NUMBER
	}
};
const callsArgReturnsNumber: RawMemberDescription = {
	value: {
		callsArgs: [0],
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_NUMBER
	}
};

const UNKNOWN_LITERAL_STRING: ExpressionEntity = {
	deoptimizePath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	getReturnExpressionWhenCalledAtPath: path => {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	},
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: (path, callOptions, options) => {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(literalStringMembers, path[0], true, callOptions, options);
		}
		return true;
	},
	include: () => {},
	included: true,
	toString: () => '[[UNKNOWN STRING]]'
};

const returnsString: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_STRING
	}
};

export class UnknownObjectExpression implements ExpressionEntity {
	included = false;

	deoptimizePath() {}

	getLiteralValueAtPath() {
		return UNKNOWN_VALUE;
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(objectMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(objectMembers, path[0], this.included, callOptions, options);
		}
		return true;
	}

	include() {
		this.included = true;
	}

	toString() {
		return '[[UNKNOWN OBJECT]]';
	}
}

export const objectMembers: MemberDescriptions = assembleMemberDescriptions({
	hasOwnProperty: returnsBoolean,
	isPrototypeOf: returnsBoolean,
	propertyIsEnumerable: returnsBoolean,
	toLocaleString: returnsString,
	toString: returnsString,
	valueOf: returnsUnknown
});

export const arrayMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		concat: returnsArray,
		copyWithin: mutatesSelfReturnsArray,
		every: callsArgReturnsBoolean,
		fill: mutatesSelfReturnsArray,
		filter: callsArgReturnsArray,
		find: callsArgReturnsUnknown,
		findIndex: callsArgReturnsNumber,
		forEach: callsArgReturnsUnknown,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		join: returnsString,
		lastIndexOf: returnsNumber,
		map: callsArgReturnsArray,
		pop: mutatesSelfReturnsUnknown,
		push: mutatesSelfReturnsNumber,
		reduce: callsArgReturnsUnknown,
		reduceRight: callsArgReturnsUnknown,
		reverse: mutatesSelfReturnsArray,
		shift: mutatesSelfReturnsUnknown,
		slice: returnsArray,
		some: callsArgReturnsBoolean,
		sort: callsArgMutatesSelfReturnsArray,
		splice: mutatesSelfReturnsArray,
		unshift: mutatesSelfReturnsNumber
	},
	objectMembers
);

const literalBooleanMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		valueOf: returnsBoolean
	},
	objectMembers
);

const literalNumberMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		toExponential: returnsString,
		toFixed: returnsString,
		toLocaleString: returnsString,
		toPrecision: returnsString,
		valueOf: returnsNumber
	},
	objectMembers
);

const literalStringMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		charAt: returnsString,
		charCodeAt: returnsNumber,
		codePointAt: returnsNumber,
		concat: returnsString,
		endsWith: returnsBoolean,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		lastIndexOf: returnsNumber,
		localeCompare: returnsNumber,
		match: returnsBoolean,
		normalize: returnsString,
		padEnd: returnsString,
		padStart: returnsString,
		repeat: returnsString,
		replace: {
			value: {
				callsArgs: [1],
				mutatesSelf: false,
				returns: null,
				returnsPrimitive: UNKNOWN_LITERAL_STRING
			}
		},
		search: returnsNumber,
		slice: returnsString,
		split: returnsArray,
		startsWith: returnsBoolean,
		substr: returnsString,
		substring: returnsString,
		toLocaleLowerCase: returnsString,
		toLocaleUpperCase: returnsString,
		toLowerCase: returnsString,
		toUpperCase: returnsString,
		trim: returnsString,
		valueOf: returnsString
	},
	objectMembers
);

export function getLiteralMembersForValue<T = LiteralValue>(value: T) {
	switch (typeof value) {
		case 'boolean':
			return literalBooleanMembers;
		case 'number':
			return literalNumberMembers;
		case 'string':
			return literalStringMembers;
		default:
			return Object.create(null);
	}
}

export function hasMemberEffectWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	parentIncluded: boolean,
	callOptions: CallOptions,
	options: ExecutionPathOptions
) {
	if (typeof memberName !== 'string' || !members[memberName]) return true;
	if (members[memberName].mutatesSelf && parentIncluded) return true;
	if (!members[memberName].callsArgs) return false;
	for (const argIndex of members[memberName].callsArgs as number[]) {
		if (
			callOptions.args[argIndex] &&
			callOptions.args[argIndex].hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				CallOptions.create({
					args: [],
					callIdentifier: {}, // make sure the caller is unique to avoid this check being ignored,
					withNew: false
				}),
				options.getHasEffectsWhenCalledOptions()
			)
		)
			return true;
	}
	return false;
}

export function getMemberReturnExpressionWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey
): ExpressionEntity {
	if (typeof memberName !== 'string' || !members[memberName]) return UNKNOWN_EXPRESSION;
	return members[memberName].returnsPrimitive !== null
		? (members[memberName].returnsPrimitive as ExpressionEntity)
		: new (members[memberName].returns as any)();
}
