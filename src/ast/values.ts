import { CallOptions, NO_ARGS } from './CallOptions';
import { HasEffectsContext } from './ExecutionContext';
import { LiteralValue } from './nodes/Literal';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './nodes/shared/Expression';
import { EMPTY_PATH, ObjectPath, ObjectPathKey } from './utils/PathTracker';

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

export const UNDEFINED_EXPRESSION: ExpressionEntity = new (class UndefinedExpression extends ExpressionEntity {
	getLiteralValueAtPath() {
		return undefined;
	}
})();

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

export class UnknownArrayExpression extends ExpressionEntity {
	included = false;

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
		context: HasEffectsContext
	) {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], this.included, callOptions, context);
		}
		return true;
	}

	include() {
		this.included = true;
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

export const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity = new (class UnknownBoolean extends ExpressionEntity {
	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalBooleanMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalBooleanMembers[subPath];
		}
		return true;
	}
})();

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

const UNKNOWN_LITERAL_NUMBER: ExpressionEntity = new (class UnknownNumber extends ExpressionEntity {
	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalNumberMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalNumberMembers[subPath];
		}
		return true;
	}
})();

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

export const UNKNOWN_LITERAL_STRING: ExpressionEntity = new (class UnknownString extends ExpressionEntity {
	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(literalStringMembers, path[0], true, callOptions, context);
		}
		return true;
	}
})();

const returnsString: RawMemberDescription = {
	value: {
		callsArgs: null,
		mutatesSelf: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_STRING
	}
};

// TODO Lukas This could just be the constant and above, we use an ObjectEntity with OBJECT_PROTOTYPE as prototype
// TODO Lukas Also, the name should reflect we assume neither getters nor setters and do not override builtins
// or just remove?
export class UnknownObjectExpression extends ExpressionEntity {
	included = false;

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
		context: HasEffectsContext
	) {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(objectMembers, path[0], this.included, callOptions, context);
		}
		return true;
	}

	include() {
		this.included = true;
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

export function getLiteralMembersForValue<T extends LiteralValue = LiteralValue>(value: T) {
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
	context: HasEffectsContext
) {
	if (
		typeof memberName !== 'string' ||
		!members[memberName] ||
		(members[memberName].mutatesSelf && parentIncluded)
	)
		return true;
	if (!members[memberName].callsArgs) return false;
	for (const argIndex of members[memberName].callsArgs!) {
		if (
			callOptions.args[argIndex] &&
			callOptions.args[argIndex].hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				{
					args: NO_ARGS,
					withNew: false
				},
				context
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
		? members[memberName].returnsPrimitive!
		: new members[memberName].returns!();
}
