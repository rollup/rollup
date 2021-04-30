import { AstContext } from '../../Module';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from '../nodes/shared/Expression';
import { ObjectPath } from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

export default class ThisVariable extends LocalVariable {
	private deoptimizedPaths: ObjectPath[] = [];
	private entitiesToBeDeoptimized: ExpressionEntity[] = [];

	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	addEntityToBeDeoptimized(entity: ExpressionEntity) {
		for (const path of this.deoptimizedPaths) {
			entity.deoptimizePath(path);
		}
		this.entitiesToBeDeoptimized.push(entity);
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) return;
		const trackedEntities = this.deoptimizationTracker.getEntities(path);
		if (trackedEntities.has(this)) return;
		trackedEntities.add(this);
		this.deoptimizedPaths.push(path);
		for (const entity of this.entitiesToBeDeoptimized) {
			entity.deoptimizePath(path);
		}
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
