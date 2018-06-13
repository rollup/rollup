import CallOptions from './CallOptions';
import { ExecutionPathOptions } from './ExecutionPathOptions';
import { LiteralValue } from './nodes/Literal';
import { ExpressionEntity, SomeReturnExpressionCallback } from './nodes/shared/Expression';

export interface UnknownKey {
	UNKNOWN_KEY: true;
}
export const UNKNOWN_KEY: UnknownKey = { UNKNOWN_KEY: true };

export type ObjectPathKey = string | UnknownKey;
export type ObjectPath = ObjectPathKey[];
export const EMPTY_PATH: ObjectPath = [];
export const UNKNOWN_PATH: ObjectPath = [UNKNOWN_KEY];

export interface MemberDescription {
	returns: ExpressionEntity;
	mutatesSelf: boolean;
	callsArgs: number[] | null;
}

export interface MemberDescriptions {
	[key: string]: MemberDescription;
}

interface RawMemberDescription {
	value: MemberDescription;
}

function assembleMemberDescriptions(
	memberDescriptions: { [key: string]: RawMemberDescription },
	inheritedDescriptions: MemberDescriptions = null
): MemberDescriptions {
	return Object.create(inheritedDescriptions, memberDescriptions);
}

export interface UnknownValue {
	UNKNOWN_VALUE: true;
}
export const UNKNOWN_VALUE: UnknownValue = { UNKNOWN_VALUE: true };
export type LiteralValueOrUnknown = LiteralValue | UnknownValue;

export const UNKNOWN_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};
export const UNDEFINED_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => 'undefined'
};
const returnsUnknown: RawMemberDescription = {
	value: { returns: UNKNOWN_EXPRESSION, callsArgs: null, mutatesSelf: false }
};
const mutatesSelfReturnsUnknown: RawMemberDescription = {
	value: { returns: UNKNOWN_EXPRESSION, callsArgs: null, mutatesSelf: true }
};
const callsArgReturnsUnknown: RawMemberDescription = {
	value: { returns: UNKNOWN_EXPRESSION, callsArgs: [0], mutatesSelf: false }
};

export const UNKNOWN_ARRAY_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: (path, callOptions, options) => {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], false, callOptions, options);
		}
		return true;
	},
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) => {
		if (path.length === 1) {
			return someMemberReturnExpressionWhenCalled(
				arrayMembers,
				path[0],
				callOptions,
				predicateFunction,
				options
			);
		}
		return true;
	},
	toString: () => '[[UNKNOWN ARRAY]]'
};
const returnsArray: RawMemberDescription = {
	value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: null, mutatesSelf: false }
};
const mutatesSelfReturnsArray: RawMemberDescription = {
	value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: null, mutatesSelf: true }
};
const callsArgReturnsArray: RawMemberDescription = {
	value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: [0], mutatesSelf: false }
};
const callsArgMutatesSelfReturnsArray: RawMemberDescription = {
	value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: [0], mutatesSelf: true }
};

const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalBooleanMembers[subPath];
		}
		return true;
	},
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) => {
		if (path.length === 1) {
			const subPath = path[0];
			return (
				typeof subPath !== 'string' ||
				!literalBooleanMembers[subPath] ||
				predicateFunction(options, literalBooleanMembers[subPath].returns)
			);
		}
		return true;
	},
	toString: () => '[[UNKNOWN BOOLEAN]]'
};
const returnsBoolean: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: null, mutatesSelf: false }
};
const callsArgReturnsBoolean: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: [0], mutatesSelf: false }
};

const UNKNOWN_LITERAL_NUMBER: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalNumberMembers[subPath];
		}
		return true;
	},
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) => {
		if (path.length === 1) {
			const subPath = path[0];
			return (
				typeof subPath !== 'string' ||
				!literalNumberMembers[subPath] ||
				predicateFunction(options, literalNumberMembers[subPath].returns)
			);
		}
		return true;
	},
	toString: () => '[[UNKNOWN NUMBER]]'
};
const returnsNumber: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: null, mutatesSelf: false }
};
const mutatesSelfReturnsNumber: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: null, mutatesSelf: true }
};
const callsArgReturnsNumber: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: [0], mutatesSelf: false }
};

const UNKNOWN_LITERAL_STRING: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !literalStringMembers[subPath];
		}
		return true;
	},
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) => {
		if (path.length === 1) {
			const subPath = path[0];
			return (
				typeof subPath !== 'string' ||
				!literalStringMembers[subPath] ||
				predicateFunction(options, literalStringMembers[subPath].returns)
			);
		}
		return true;
	},
	toString: () => '[[UNKNOWN STRING]]'
};
const returnsString: RawMemberDescription = {
	value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: null, mutatesSelf: false }
};

export const UNKNOWN_OBJECT_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getLiteralValueAtPath: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return typeof subPath !== 'string' || !objectMembers[subPath];
		}
		return true;
	},
	someReturnExpressionWhenCalledAtPath: (
		path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) => {
		if (path.length === 1) {
			const subPath = path[0];
			return (
				typeof subPath !== 'string' ||
				!objectMembers[subPath] ||
				predicateFunction(options, objectMembers[subPath].returns)
			);
		}
		return true;
	},
	toString: () => '[[UNKNOWN OBJECT]]'
};

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
		includes: returnsBoolean,
		endsWith: returnsBoolean,
		indexOf: returnsNumber,
		lastIndexOf: returnsNumber,
		localeCompare: returnsNumber,
		match: returnsBoolean,
		normalize: returnsString,
		padEnd: returnsString,
		padStart: returnsString,
		repeat: returnsString,
		replace: {
			value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: [1], mutatesSelf: false }
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
	for (const argIndex of members[memberName].callsArgs) {
		if (
			callOptions.args[argIndex] &&
			callOptions.args[argIndex].hasEffectsWhenCalledAtPath(
				[],
				CallOptions.create({
					withNew: false,
					args: [],
					callIdentifier: {} // make sure the caller is unique to avoid this check being ignored
				}),
				options.getHasEffectsWhenCalledOptions()
			)
		)
			return true;
	}
	return false;
}

export function someMemberReturnExpressionWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	callOptions: CallOptions,
	predicateFunction: SomeReturnExpressionCallback,
	options: ExecutionPathOptions
) {
	return (
		hasMemberEffectWhenCalled(members, memberName, false, callOptions, options) ||
		// if calling has no effect, memberName is a string and members[memberName] exists
		predicateFunction(options, members[<string>memberName].returns)
	);
}
