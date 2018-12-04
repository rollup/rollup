import { AstContext } from '../../Module';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import LocalVariable from './LocalVariable';

export default class ThisVariable extends LocalVariable {
	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
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

	_getInit(options: ExecutionPathOptions): ExpressionEntity {
		return options.getReplacedVariableInit(this) || UNKNOWN_EXPRESSION;
	}
}
