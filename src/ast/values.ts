import { ExpressionEntity, SomeReturnExpressionCallback } from './nodes/shared/Expression';
import { blank } from '../utils/object';
import CallOptions from './CallOptions';
import { isUnknownKey, ObjectPath } from './variables/VariableReassignmentTracker';
import { LiteralValueTypes } from './nodes/Literal';
import ExecutionPathOptions from './ExecutionPathOptions';

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
const returnsUnknown = { value: { returnExpression: UNKNOWN_EXPRESSION } };

export const UNKNOWN_ARRAY_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !pureArrayMembers[subPath];
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
				|| !pureArrayMembers[subPath]
				|| predicateFunction(options)(pureArrayMembers[subPath].returnExpression);
		}
		return true;
	},
	toString: () => '[[UNKNOWN ARRAY]]'
};
const returnsArray = { value: { returnExpression: UNKNOWN_ARRAY_EXPRESSION } };

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
				return isUnknownKey(subPath) || !pureLiteralMembers[type][subPath];
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
					|| !pureLiteralMembers[type][subPath]
					|| predicateFunction(options)(pureLiteralMembers[type][subPath].returnExpression);
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
const returnsBoolean = { value: { returnExpression: UNKNOWN_LITERALS.boolean } };
const returnsNumber = { value: { returnExpression: UNKNOWN_LITERALS.number } };
const returnsString = { value: { returnExpression: UNKNOWN_LITERALS.string } };

export const UNKNOWN_OBJECT_EXPRESSION: ExpressionEntity = {
	reassignPath: () => {},
	forEachReturnExpressionWhenCalledAtPath: () => {},
	getValue: () => UNKNOWN_VALUE,
	hasEffectsWhenAccessedAtPath: path => path.length > 1,
	hasEffectsWhenAssignedAtPath: path => path.length > 1,
	hasEffectsWhenCalledAtPath: path => {
		if (path.length === 1) {
			const subPath = path[0];
			return isUnknownKey(subPath) || !pureObjectMembers[subPath];
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
				|| !pureObjectMembers[subPath]
				|| predicateFunction(options)(pureObjectMembers[subPath].returnExpression);
		}
		return true;
	},
	toString: () => '[[UNKNOWN OBJECT]]'
};

export const pureArrayMembers: { [key: string]: { returnExpression: ExpressionEntity } } =
	Object.create(null, {
		concat: returnsArray,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		join: returnsString,
		lastIndexOf: returnsNumber,
		slice: returnsArray,
		toLocaleString: returnsString,
		toString: returnsString
	});

const pureLiteralMembers: { [key: string]: { [key: string]: { returnExpression: ExpressionEntity } } } = {
	boolean: Object.create(null, {
		toString: returnsString,
		valueOf: returnsBoolean
	}),
	number: Object.create(null, {
		toExponential: returnsString,
		toFixed: returnsString,
		toLocaleString: returnsString,
		toPrecision: returnsString,
		toString: returnsString,
		valueOf: returnsNumber
	}),
	string: Object.create(null, {
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

export const pureObjectMembers: { [key: string]: { returnExpression: ExpressionEntity } } =
	Object.create(null, {
		hasOwnProperty: returnsBoolean,
		isPrototypeOf: returnsBoolean,
		propertyIsEnumerable: returnsBoolean,
		toLocaleString: returnsString,
		toString: returnsString,
		valueOf: returnsUnknown
	});

export function getPureLiteralMembersForValue<T = LiteralValueTypes> (value: T) {
	switch (typeof value) {
		case 'boolean':
			return pureLiteralMembers.boolean;
		case 'number':
			return pureLiteralMembers.number;
		case 'string':
			return pureLiteralMembers.string;
		default:
			return blank();
	}
}
