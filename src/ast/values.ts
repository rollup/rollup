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

function assembleMemberDescriptions (memberDescriptions: { [key: string]: RawMemberDescription }): MemberDescriptions {
	return Object.create(null, memberDescriptions);
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

function createUnknownLiteral (type: 'boolean' | 'number' | 'string'): ExpressionEntity {
	return {
		reassignPath: () => {},
		forEachReturnExpressionWhenCalledAtPath: () => {},
		getValue: () => UNKNOWN_VALUE,
		hasEffectsWhenAccessedAtPath: path => path.length > 1,
		hasEffectsWhenAssignedAtPath: path => path.length > 0,
		hasEffectsWhenCalledAtPath: path => {
			if (path.length === 1) {
				const subPath = path[0];
				return isUnknownKey(subPath) || !literalMembers[type][subPath];
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
					|| !literalMembers[type][subPath]
					|| predicateFunction(options)(literalMembers[type][subPath].returns);
			}
			return true;
		},
		toString: () => '[[UNKNOWN STRING]]'
	};
}

export const UNKNOWN_LITERALS = {
	boolean: createUnknownLiteral('boolean'),
	number: createUnknownLiteral('number'),
	string: createUnknownLiteral('string')
};
const returnsBoolean: RawMemberDescription = { value: { returns: UNKNOWN_LITERALS.boolean, callsArgs: null } };
const callsArgReturnsBoolean: RawMemberDescription = { value: { returns: UNKNOWN_LITERALS.boolean, callsArgs: [0] } };
const returnsNumber: RawMemberDescription = { value: { returns: UNKNOWN_LITERALS.number, callsArgs: null } };
const callsArgReturnsNumber: RawMemberDescription = { value: { returns: UNKNOWN_LITERALS.number, callsArgs: [0] } };
const returnsString: RawMemberDescription = { value: { returns: UNKNOWN_LITERALS.string, callsArgs: null } };

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

export const arrayMembers: MemberDescriptions =
	assembleMemberDescriptions({
		concat: returnsArray,
		every: callsArgReturnsBoolean,
		filter: callsArgReturnsArray,
		find: callsArgReturnsUnknown,
		findIndex: callsArgReturnsNumber,
		forEach: callsArgReturnsUnknown,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		join: returnsString,
		lastIndexOf: returnsNumber,
		map: callsArgReturnsArray,
		reduce: callsArgReturnsUnknown,
		reduceRight: callsArgReturnsUnknown,
		slice: returnsArray,
		some: callsArgReturnsBoolean,
		toLocaleString: returnsString,
		toString: returnsString
	});

const literalMembers: { [key: string]: MemberDescriptions } = {
	boolean: assembleMemberDescriptions({
		toString: returnsString,
		valueOf: returnsBoolean
	}),
	number: assembleMemberDescriptions({
		toExponential: returnsString,
		toFixed: returnsString,
		toLocaleString: returnsString,
		toPrecision: returnsString,
		toString: returnsString,
		valueOf: returnsNumber
	}),
	string: assembleMemberDescriptions({
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
		search: returnsNumber,
		slice: returnsString,
		split: returnsArray,
		startsWith: returnsBoolean,
		substr: returnsString,
		substring: returnsString,
		toLocaleLowerCase: returnsString,
		toLocaleUpperCase: returnsString,
		toLowerCase: returnsString,
		toString: returnsString,
		toUpperCase: returnsString,
		trim: returnsString,
		valueOf: returnsString
	})
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

export function getLiteralMembersForValue<T = LiteralValueTypes> (value: T) {
	switch (typeof value) {
		case 'boolean':
			return literalMembers.boolean;
		case 'number':
			return literalMembers.number;
		case 'string':
			return literalMembers.string;
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
						caller: {} // make sure the caller is unique to avoid this check being ignored
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
		// if calling has no effect, members[memberName] exists
		|| predicateFunction(options)(members[<string>memberName].returns);
}
