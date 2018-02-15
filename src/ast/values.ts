import { ExpressionEntity, SomeReturnExpressionCallback } from './nodes/shared/Expression';
import { blank } from '../utils/object';
import CallOptions from './CallOptions';
import { isUnknownKey, ObjectPath, ObjectPathKey } from './variables/VariableReassignmentTracker';
import { LiteralValueTypes } from './nodes/Literal';
import ExecutionPathOptions from './ExecutionPathOptions';

export interface MemberDescription {
	returns: ExpressionEntity,
	callsArgs: number[] | null
}

export interface MemberDescriptions {
	[key: string]: MemberDescription
}

type RawMemberDescription = { value: MemberDescription };

function assembleMemberDescriptions (
	memberDescriptions: { [key: string]: RawMemberDescription },
	inheritedDescriptions: MemberDescriptions = null
): MemberDescriptions {
	return Object.create(inheritedDescriptions, memberDescriptions);
}

export const UNKNOWN_VALUE = { toString: () => '[[UNKNOWN]]' };

export const UNKNOWN_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 0,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: () => true,
	someReturnExpressionWhenCalledAtPath: () => true,
	toString: () => '[[UNKNOWN]]'
};
const returnsUnknown: RawMemberDescription = { value: { returns: UNKNOWN_EXPRESSION, callsArgs: null } };
const callsArgReturnsUnknown: RawMemberDescription = { value: { returns: UNKNOWN_EXPRESSION, callsArgs: [0] } };

export const UNKNOWN_ARRAY_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: (path, callOptions, options) => {
		if (path.length === 1) {
			return hasMemberEffectWhenCalled(arrayMembers, path[0], callOptions, options);
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
			return someMemberReturnExpressionWhenCalled(arrayMembers, path[0], callOptions, predicateFunction, options);
		}
		return true;
	},
	toString: () => '[[UNKNOWN ARRAY]]'
};
const returnsArray: RawMemberDescription = { value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: null } };
const callsArgReturnsArray: RawMemberDescription = { value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: [0] } };

const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !literalBooleanMembers[subPath];
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
			return isUnknownKey(subPath)
				|| !literalBooleanMembers[subPath]
				|| predicateFunction(options)(literalBooleanMembers[subPath].returns);
		}
		return true;
	},
	toString: () => '[[UNKNOWN BOOLEAN]]'
};
const returnsBoolean: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: null } };
const callsArgReturnsBoolean: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: [0] } };

const UNKNOWN_LITERAL_NUMBER: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !literalNumberMembers[subPath];
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
			return isUnknownKey(subPath)
				|| !literalNumberMembers[subPath]
				|| predicateFunction(options)(literalNumberMembers[subPath].returns);
		}
		return true;
	},
	toString: () => '[[UNKNOWN NUMBER]]'
};
const returnsNumber: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: null } };
const callsArgReturnsNumber: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: [0] } };


const UNKNOWN_LITERAL_STRING: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 0,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !literalStringMembers[subPath];
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
			return isUnknownKey(subPath)
				|| !literalStringMembers[subPath]
				|| predicateFunction(options)(literalStringMembers[subPath].returns);
		}
		return true;
	},
	toString: () => '[[UNKNOWN STRING]]'
};
const returnsString: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: null } };
const callsSecondArgReturnsString: RawMemberDescription = { value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: [1] } };

export const UNKNOWN_OBJECT_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !objectMembers[subPath];
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
			return isUnknownKey(subPath)
				|| !objectMembers[subPath]
				|| predicateFunction(options)(objectMembers[subPath].returns);
		}
		return true;
	},
	toString: () => '[[UNKNOWN OBJECT]]'
};

export const objectMembers: MemberDescriptions =
	assembleMemberDescriptions({
		hasOwnProperty: returnsBoolean,
		isPrototypeOf: returnsBoolean,
		propertyIsEnumerable: returnsBoolean,
		toLocaleString: returnsString,
		toString: returnsString,
		valueOf: returnsUnknown
	});

export const arrayMembers: MemberDescriptions =
	assembleMemberDescriptions({
		concat: returnsArray,
		copyWithin: returnsArray,
		every: callsArgReturnsBoolean,
		fill: returnsArray,
		filter: callsArgReturnsArray,
		find: callsArgReturnsUnknown,
		findIndex: callsArgReturnsNumber,
		forEach: callsArgReturnsUnknown,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		join: returnsString,
		lastIndexOf: returnsNumber,
		map: callsArgReturnsArray,
		pop: returnsUnknown,
		push: returnsNumber,
		reduce: callsArgReturnsUnknown,
		reduceRight: callsArgReturnsUnknown,
		reverse: returnsArray,
		shift: returnsUnknown,
		slice: returnsArray,
		some: callsArgReturnsBoolean,
		sort: callsArgReturnsArray,
		splice: returnsArray,
		unshift: returnsNumber
	}, objectMembers);

const literalBooleanMembers: MemberDescriptions = assembleMemberDescriptions({
	valueOf: returnsBoolean
}, objectMembers);

const literalNumberMembers: MemberDescriptions = assembleMemberDescriptions({
	toExponential: returnsString,
	toFixed: returnsString,
	toLocaleString: returnsString,
	toPrecision: returnsString,
	valueOf: returnsNumber
}, objectMembers);

const literalStringMembers: MemberDescriptions = assembleMemberDescriptions({
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
	replace: callsSecondArgReturnsString,
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
}, objectMembers);

export function getLiteralMembersForValue<T = LiteralValueTypes> (value: T) {
	switch (typeof value) {
		case 'boolean':
			return literalBooleanMembers;
		case 'number':
			return literalNumberMembers;
		case 'string':
			return literalStringMembers;
		default:
			return blank();
	}
}

export function hasMemberEffectWhenCalled (
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	callOptions: CallOptions,
	options: ExecutionPathOptions
) {
	return isUnknownKey(memberName)
		|| !members[memberName]
		|| (
			members[memberName].callsArgs
			&& members[memberName].callsArgs.some(argIndex => callOptions.args[argIndex]
				&& callOptions.args[argIndex].hasEffectsWhenCalledAtPath(
					[],
					CallOptions.create({
						withNew: false,
						args: [],
						callIdentifier: {} // make sure the caller is unique to avoid this check being ignored
					}),
					options.getHasEffectsWhenCalledOptions()
				))
		);
}

export function someMemberReturnExpressionWhenCalled (
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	callOptions: CallOptions,
	predicateFunction: SomeReturnExpressionCallback,
	options: ExecutionPathOptions
) {
	return hasMemberEffectWhenCalled(members, memberName, callOptions, options)
		// if calling has no effect, memberName is a string and members[memberName] exists
		|| predicateFunction(options)(members[<string>memberName].returns);
}
