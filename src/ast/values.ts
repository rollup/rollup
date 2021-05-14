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

export const UNKNOWN_LITERAL_NUMBER: ExpressionEntity = new (class UnknownNumber extends ExpressionEntity {
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

const objectMembers: MemberDescriptions = assembleMemberDescriptions({
	hasOwnProperty: returnsBoolean,
	isPrototypeOf: returnsBoolean,
	propertyIsEnumerable: returnsBoolean,
	toLocaleString: returnsString,
	toString: returnsString,
	valueOf: returnsUnknown
});

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
		split: returnsUnknown,
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
					// TODO Lukas think about this
					thisParam: null,
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
