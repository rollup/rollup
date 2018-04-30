import LocalVariable from './LocalVariable';
import { ObjectPath, PrimitiveValue, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity, SomeReturnExpressionCallback } from '../nodes/shared/Expression';

export default class ReplaceableInitializationVariable extends LocalVariable {
	constructor(name: string, declarator: Identifier | null) {
		super(name, declarator, null);
	}

	getPrimitiveValueAtPath(): PrimitiveValue {
		return UNKNOWN_VALUE;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		return (
			this._getInit(options).hasEffectsWhenAccessedAtPath(path, options) ||
			super.hasEffectsWhenAccessedAtPath(path, options)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		return (
			this._getInit(options).hasEffectsWhenAssignedAtPath(path, options) ||
			super.hasEffectsWhenAssignedAtPath(path, options)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		return (
			this._getInit(options).hasEffectsWhenCalledAtPath(path, callOptions, options) ||
			super.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return (
			this._getInit(options).someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			) || super.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options)
		);
	}

	_getInit(options: ExecutionPathOptions): ExpressionEntity {
		return options.getReplacedVariableInit(this) || UNKNOWN_EXPRESSION;
	}
}
