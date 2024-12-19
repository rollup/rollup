import type { HasEffectsContext } from './ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from './NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_CALL
} from './NodeInteractions';
import type { LiteralValueOrBigInt } from './nodes/Literal';
import type { LiteralValueOrUnknown } from './nodes/shared/Expression';
import {
	ExpressionEntity,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from './nodes/shared/Expression';
import {
	EMPTY_PATH,
	type ObjectPath,
	type ObjectPathKey,
	SHARED_RECURSION_TRACKER
} from './utils/PathTracker';

export interface MemberDescription {
	hasEffectsWhenCalled:
		| ((interaction: NodeInteractionCalled, context: HasEffectsContext) => boolean)
		| null;
	returns: ExpressionEntity;
}

export type MemberDescriptions = Record<string, MemberDescription>;

interface RawMemberDescription {
	value: MemberDescription;
}

function assembleMemberDescriptions(
	memberDescriptions: Record<string, RawMemberDescription>,
	inheritedDescriptions: MemberDescriptions | null = null
): MemberDescriptions {
	return Object.create(inheritedDescriptions, memberDescriptions);
}

export const UNDEFINED_EXPRESSION: ExpressionEntity =
	new (class UndefinedExpression extends ExpressionEntity {
		getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
			return path.length > 0 ? UnknownValue : undefined;
		}
	})();

const returnsUnknown: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_EXPRESSION
	}
};

export const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity =
	new (class UnknownBoolean extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(
			path: ObjectPath
		): [expression: ExpressionEntity, isPure: boolean] {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalBooleanMembers, path[0]);
			}
			return UNKNOWN_RETURN_EXPRESSION;
		}

		hasEffectsOnInteractionAtPath(
			path: ObjectPath,
			interaction: NodeInteraction,
			context: HasEffectsContext
		): boolean {
			if (interaction.type === INTERACTION_ACCESSED) {
				return path.length > 1;
			}
			if (interaction.type === INTERACTION_CALLED && path.length === 1) {
				return hasMemberEffectWhenCalled(literalBooleanMembers, path[0], interaction, context);
			}
			return true;
		}
	})();

const returnsBoolean: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_BOOLEAN
	}
};

export const UNKNOWN_LITERAL_NUMBER: ExpressionEntity =
	new (class UnknownNumber extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(
			path: ObjectPath
		): [expression: ExpressionEntity, isPure: boolean] {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalNumberMembers, path[0]);
			}
			return UNKNOWN_RETURN_EXPRESSION;
		}

		hasEffectsOnInteractionAtPath(
			path: ObjectPath,
			interaction: NodeInteraction,
			context: HasEffectsContext
		): boolean {
			if (interaction.type === INTERACTION_ACCESSED) {
				return path.length > 1;
			}
			if (interaction.type === INTERACTION_CALLED && path.length === 1) {
				return hasMemberEffectWhenCalled(literalNumberMembers, path[0], interaction, context);
			}
			return true;
		}
	})();

const returnsNumber: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_NUMBER
	}
};

export const UNKNOWN_LITERAL_STRING: ExpressionEntity =
	new (class UnknownString extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(
			path: ObjectPath
		): [expression: ExpressionEntity, isPure: boolean] {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
			}
			return UNKNOWN_RETURN_EXPRESSION;
		}

		hasEffectsOnInteractionAtPath(
			path: ObjectPath,
			interaction: NodeInteraction,
			context: HasEffectsContext
		): boolean {
			if (interaction.type === INTERACTION_ACCESSED) {
				return path.length > 1;
			}
			if (interaction.type === INTERACTION_CALLED && path.length === 1) {
				return hasMemberEffectWhenCalled(literalStringMembers, path[0], interaction, context);
			}
			return true;
		}
	})();

const returnsString: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_STRING
	}
};

const stringReplace: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled({ args }, context) {
			const argument1 = args[2];
			return (
				args.length < 3 ||
				(typeof argument1.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, {
					deoptimizeCache() {}
				}) === 'symbol' &&
					argument1.hasEffectsOnInteractionAtPath(
						EMPTY_PATH,
						NODE_INTERACTION_UNKNOWN_CALL,
						context
					))
			);
		},
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

/**
 * RegExp are stateful when they have the global or sticky flags set.
 * But if we actually don't use them, the side effect does not matter.
 * the check logic in `hasEffectsOnInteractionAtPath`.
 */
const literalRegExpMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		exec: returnsUnknown,
		test: returnsBoolean
	},
	objectMembers
);

export const literalStringMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		anchor: returnsString,

		at: returnsUnknown,
		big: returnsString,
		blink: returnsString,
		bold: returnsString,
		charAt: returnsString,
		charCodeAt: returnsNumber,
		codePointAt: returnsUnknown,
		concat: returnsString,
		endsWith: returnsBoolean,
		fixed: returnsString,
		fontcolor: returnsString,
		fontsize: returnsString,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		italics: returnsString,
		lastIndexOf: returnsNumber,
		link: returnsString,
		localeCompare: returnsNumber,
		match: returnsUnknown,
		matchAll: returnsUnknown,
		normalize: returnsString,
		padEnd: returnsString,
		padStart: returnsString,
		repeat: returnsString,
		replace: stringReplace,
		replaceAll: stringReplace,
		search: returnsNumber,
		slice: returnsString,
		small: returnsString,
		split: returnsUnknown,
		startsWith: returnsBoolean,
		strike: returnsString,
		sub: returnsString,
		substr: returnsString,
		substring: returnsString,
		sup: returnsString,
		toLocaleLowerCase: returnsString,
		toLocaleUpperCase: returnsString,
		toLowerCase: returnsString,
		toString: returnsString, // overrides the toString() method of the Object object; it does not inherit Object.prototype.toString()
		toUpperCase: returnsString,
		trim: returnsString,
		trimEnd: returnsString,
		trimLeft: returnsString,
		trimRight: returnsString,
		trimStart: returnsString,
		valueOf: returnsString
	},
	objectMembers
);

export function getLiteralMembersForValue<T extends LiteralValueOrBigInt = LiteralValueOrBigInt>(
	value: T
): MemberDescriptions {
	if (value instanceof RegExp) {
		return literalRegExpMembers;
	}
	switch (typeof value) {
		case 'boolean': {
			return literalBooleanMembers;
		}
		case 'number': {
			return literalNumberMembers;
		}
		case 'string': {
			return literalStringMembers;
		}
	}
	return Object.create(null);
}

export function hasMemberEffectWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	interaction: NodeInteractionCalled,
	context: HasEffectsContext
): boolean {
	if (typeof memberName !== 'string' || !members[memberName]) {
		return true;
	}
	return members[memberName].hasEffectsWhenCalled?.(interaction, context) || false;
}

export function getMemberReturnExpressionWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey
): [expression: ExpressionEntity, isPure: boolean] {
	if (typeof memberName !== 'string' || !members[memberName]) return UNKNOWN_RETURN_EXPRESSION;
	return [members[memberName].returns, false];
}
