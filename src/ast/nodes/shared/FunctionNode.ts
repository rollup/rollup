import { type CallOptions } from '../../CallOptions';
import { type HasEffectsContext, type InclusionContext } from '../../ExecutionContext';
import { EVENT_CALLED, type NodeEvent } from '../../NodeEvents';
import FunctionScope from '../../scopes/FunctionScope';
import { type ObjectPath, PathTracker } from '../../utils/PathTracker';
import BlockStatement from '../BlockStatement';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from './Expression';
import FunctionBase from './FunctionBase';
import { type IncludeChildren } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { PatternNode } from './Pattern';

export default class FunctionNode extends FunctionBase {
	declare async: boolean;
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	protected objectEntity: ObjectEntity | null = null;

	createScope(parentScope: FunctionScope): void {
		this.scope = new FunctionScope(parentScope, this.context);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		super.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
		if (event === EVENT_CALLED && path.length === 0) {
			this.scope.thisVariable.addEntityToBeDeoptimized(thisParameter);
		}
	}

	hasEffects(): boolean {
		return this.id !== null && this.id.hasEffects();
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (super.hasEffectsWhenCalledAtPath(path, callOptions, context)) return true;
		const thisInit = context.replacedVariableInits.get(this.scope.thisVariable);
		context.replacedVariableInits.set(
			this.scope.thisVariable,
			callOptions.withNew
				? new ObjectEntity(Object.create(null), OBJECT_PROTOTYPE)
				: UNKNOWN_EXPRESSION
		);
		const { brokenFlow, ignore } = context;
		context.ignore = {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnYield: true
		};
		if (this.body.hasEffects(context)) return true;
		context.brokenFlow = brokenFlow;
		if (thisInit) {
			context.replacedVariableInits.set(this.scope.thisVariable, thisInit);
		} else {
			context.replacedVariableInits.delete(this.scope.thisVariable);
		}
		context.ignore = ignore;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		super.include(context, includeChildrenRecursively);
		if (this.id) this.id.include();
		const hasArguments = this.scope.argumentsVariable.included;
		for (const param of this.params) {
			if (!(param instanceof Identifier) || hasArguments) {
				param.include(context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		super.initialise();
		this.id?.declare('function', this);
	}

	protected getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		return (this.objectEntity = new ObjectEntity(
			[
				{
					key: 'prototype',
					kind: 'init',
					property: new ObjectEntity([], OBJECT_PROTOTYPE)
				}
			],
			OBJECT_PROTOTYPE
		));
	}
}
