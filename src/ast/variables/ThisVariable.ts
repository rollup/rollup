import { AstContext } from '../../Module';
import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	NodeEvent,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from '../nodes/shared/Expression';
import { ObjectPath, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface ThisDeoptimizationEvent {
	event: NodeEvent;
	path: ObjectPath;
	thisParameter: ExpressionEntity;
}

export default class ThisVariable extends LocalVariable {
	private deoptimizedPaths: ObjectPath[] = [];
	private entitiesToBeDeoptimized = new Set<ExpressionEntity>();
	private thisDeoptimizations: ThisDeoptimizationEvent[] = [];

	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	addEntityToBeDeoptimized(entity: ExpressionEntity) {
		for (const path of this.deoptimizedPaths) {
			entity.deoptimizePath(path);
		}
		for (const thisDeoptimization of this.thisDeoptimizations) {
			this.applyThisDeoptimizationEvent(entity, thisDeoptimization);
		}
		this.entitiesToBeDeoptimized.add(entity);
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

	deoptimizeThisOnEventAtPath(event: NodeEvent, path: ObjectPath, thisParameter: ExpressionEntity) {
		const thisDeoptimization: ThisDeoptimizationEvent = {
			event,
			path,
			thisParameter
		};
		for (const entity of this.entitiesToBeDeoptimized) {
			this.applyThisDeoptimizationEvent(entity, thisDeoptimization);
		}
		this.thisDeoptimizations.push(thisDeoptimization);
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

	private applyThisDeoptimizationEvent(
		entity: ExpressionEntity,
		{ event, path, thisParameter }: ThisDeoptimizationEvent
	) {
		entity.deoptimizeThisOnEventAtPath(
			event,
			path,
			thisParameter === this ? entity : thisParameter,
			SHARED_RECURSION_TRACKER
		);
	}

	private getInit(context: HasEffectsContext): ExpressionEntity {
		return context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION;
	}
}
