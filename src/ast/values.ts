import { CallOptions, NO_ARGS } from './CallOptions';
import { HasEffectsContext } from './ExecutionContext';
import { LiteralValue } from './nodes/Literal';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './nodes/shared/Expression';
import { EMPTY_PATH, ObjectPath, ObjectPathKey } from './utils/PathTracker';

export interface MemberDescription {
	callsArgs: number[] | null;
	returns: ExpressionEntity;
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

export const UNDEFINED_EXPRESSION: ExpressionEntity =
	new (class UndefinedExpression extends ExpressionEntity {
		getLiteralValueAtPath() {
			return undefined;
		}
	})();

const returnsUnknown: RawMemberDescription = {
	value: {
		callsArgs: null,
		returns: UNKNOWN_EXPRESSION
	}
};

export const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity =
	new (class UnknownBoolean extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalBooleanMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalBooleanMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsBoolean: RawMemberDescription = {
	value: {
		callsArgs: null,
		returns: UNKNOWN_LITERAL_BOOLEAN
	}
};

export const UNKNOWN_LITERAL_NUMBER: ExpressionEntity =
	new (class UnknownNumber extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalNumberMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalNumberMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsNumber: RawMemberDescription = {
	value: {
		callsArgs: null,
		returns: UNKNOWN_LITERAL_NUMBER
	}
};

export const UNKNOWN_LITERAL_STRING: ExpressionEntity =
	new (class UnknownString extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalStringMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsString: RawMemberDescription = {
	value: {
		callsArgs: null,
		returns: UNKNOWN_LITERAL_STRING
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
		// note on DEPRECATED methods:
		// we still have support until being removed from engines (if ever)
		anchor: returnsString, // DEPRECATED
		at: returnsUnknown,
		big: returnsString, // DEPRECATED
		blink: returnsString, // DEPRECATED
		bold: returnsString, // DEPRECATED
		charAt: returnsString,
		charCodeAt: returnsNumber,
		codePointAt: returnsUnknown,
		concat: returnsString,
		endsWith: returnsBoolean,
		fixed: returnsString, // DEPRECATED
		fontcolor: returnsString, // DEPRECATED
		fontsize: returnsString, // DEPRECATED
		includes: returnsBoolean,
		indexOf: returnsNumber,
		italics: returnsString, // DEPRECATED
		lastIndexOf: returnsNumber,
		link: returnsString, // DEPRECATED
		localeCompare: returnsNumber,
		match: returnsUnknown,
		matchAll: returnsUnknown,
		normalize: returnsString,
		padEnd: returnsString,
		padStart: returnsString,
		repeat: returnsString,
		replace: {
			value: {
				callsArgs: [1],
				returns: UNKNOWN_LITERAL_STRING
			}
		},
		replaceAll: {
			value: {
				callsArgs: [1],
				returns: UNKNOWN_LITERAL_STRING
			}
		},
		search: returnsNumber,
		slice: returnsString,
		small: returnsString, // DEPRECATED
		split: returnsUnknown,
		startsWith: returnsBoolean,
		strike: returnsString, // DEPRECATED
		sub: returnsString, // DEPRECATED
		substr: returnsString, // DEPRECATED
		substring: returnsString,
		sup: returnsString, // DEPRECATED
		toLocaleLowerCase: returnsString,
		toLocaleUpperCase: returnsString,
		toLowerCase: returnsString,
		toString: returnsString, // overrides the toString() method of the Object object; it does not inherit Object.prototype.toString()
		toUpperCase: returnsString,
		trim: returnsString,
		trimEnd: returnsString,
		trimLeft: returnsString, // DEPRECATED, alias for trimStart
		trimRight: returnsString, // DEPRECATED, alias for trimEnd
		trimStart: returnsString,
		valueOf: returnsString
	},
	objectMembers
);

export function getLiteralMembersForValue<T extends LiteralValue = LiteralValue>(
	value: T
): MemberDescriptions {
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
	callOptions: CallOptions,
	context: HasEffectsContext
): boolean {
	if (typeof memberName !== 'string' || !members[memberName]) {
		return true;
	}
	if (!members[memberName].callsArgs) return false;
	for (const argIndex of members[memberName].callsArgs!) {
		if (
			callOptions.args[argIndex] &&
			callOptions.args[argIndex].hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				{
					args: NO_ARGS,
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
	return members[memberName].returns;
}
