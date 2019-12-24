import { AstContext } from '../../Module';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { ObjectPath } from '../utils/PathTracker';
import { LiteralValueOrUnknown, UNKNOWN_EXPRESSION, UnknownValue } from '../values';
import LocalVariable from './LocalVariable';

export default class ThisVariable extends LocalVariable {
	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return UnknownValue;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return (
			this.getInit(context).hasEffectsWhenAccessedAtPath(path, context) ||
			super.hasEffectsWhenAccessedAtPath(path, context)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		return (
			this.getInit(context).hasEffectsWhenAssignedAtPath(path, context) ||
			super.hasEffectsWhenAssignedAtPath(path, context)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return (
			this.getInit(context).hasEffectsWhenCalledAtPath(path, callOptions, context) ||
			super.hasEffectsWhenCalledAtPath(path, callOptions, context)
		);
	}

	private getInit(context: HasEffectsContext): ExpressionEntity {
		return context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION;
	}
}
