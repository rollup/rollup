import type { NormalizedTreeshakingOptions } from '../../../rollup/types';
import { type CallOptions, NO_ARGS } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import {
	BROKEN_FLOW_NONE,
	type HasEffectsContext,
	type InclusionContext
} from '../../ExecutionContext';
import { EVENT_CALLED, type NodeEvent } from '../../NodeEvents';
import FunctionScope from '../../scopes/FunctionScope';
import { type ObjectPath, PathTracker, UNKNOWN_PATH, UnknownKey } from '../../utils/PathTracker';
import BlockStatement from '../BlockStatement';
import Identifier, { type IdentifierWithVariable } from '../Identifier';
import RestElement from '../RestElement';
import type SpreadElement from '../SpreadElement';
import { type ExpressionEntity, LiteralValueOrUnknown, UNKNOWN_EXPRESSION } from './Expression';
import {
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase
} from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import type { PatternNode } from './Pattern';

// TODO Lukas create shared base with arrow functions
export default class FunctionNode extends NodeBase {
	declare async: boolean;
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: readonly PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	private deoptimizedReturn = false;
	private objectEntity: ObjectEntity | null = null;

	createScope(parentScope: FunctionScope): void {
		this.scope = new FunctionScope(parentScope, this.context);
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
		if (path.length === 1 && path[0] === UnknownKey) {
			// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
			// which means the return expression needs to be reassigned as well
			this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (path.length > 0) {
			this.getObjectEntity().deoptimizeThisOnEventAtPath(
				event,
				path,
				thisParameter,
				recursionTracker
			);
		} else if (event === EVENT_CALLED) {
			this.scope.thisVariable.addEntityToBeDeoptimized(thisParameter);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length > 0) {
			return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				recursionTracker,
				origin
			);
		}
		if (this.async) {
			if (!this.deoptimizedReturn) {
				this.deoptimizedReturn = true;
				this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
				this.context.requestTreeshakingPass();
			}
			return UNKNOWN_EXPRESSION;
		}
		return this.scope.getReturnExpression();
	}

	hasEffects(): boolean {
		return this.id !== null && this.id.hasEffects();
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(
		path: ObjectPath,
		context: HasEffectsContext,
		ignoreAccessors: boolean
	): boolean {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context, ignoreAccessors);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0) {
			return this.getObjectEntity().hasEffectsWhenCalledAtPath(path, callOptions, context);
		}
		if (this.async) {
			const { propertyReadSideEffects } = this.context.options
				.treeshake as NormalizedTreeshakingOptions;
			const returnExpression = this.scope.getReturnExpression();
			if (
				returnExpression.hasEffectsWhenCalledAtPath(
					['then'],
					{ args: NO_ARGS, thisParam: null, withNew: false },
					context
				) ||
				(propertyReadSideEffects &&
					(propertyReadSideEffects === 'always' ||
						returnExpression.hasEffectsWhenAccessedAtPath(['then'], context)))
			) {
				return true;
			}
		}
		for (const param of this.params) {
			if (param.hasEffects(context)) return true;
		}
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
		this.included = true;
		if (this.id) this.id.include();
		const hasArguments = this.scope.argumentsVariable.included;
		for (const param of this.params) {
			if (!(param instanceof Identifier) || hasArguments) {
				param.include(context, includeChildrenRecursively);
			}
		}
		const { brokenFlow } = context;
		context.brokenFlow = BROKEN_FLOW_NONE;
		this.body.include(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
	}

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionNode | SpreadElement)[]
	): void {
		this.scope.includeCallArguments(context, args);
	}

	initialise(): void {
		if (this.id !== null) {
			this.id.declare('function', this);
		}
		this.scope.addParameterVariables(
			this.params.map(param => param.declare('parameter', UNKNOWN_EXPRESSION)),
			this.params[this.params.length - 1] instanceof RestElement
		);
		this.body.addImplicitReturnExpressionToScope();
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		this.body = new BlockStatement(esTreeNode.body, this, this.scope.hoistedBodyVarScope);
		super.parseNode(esTreeNode);
	}

	private getObjectEntity(): ObjectEntity {
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

FunctionNode.prototype.preventChildBlockScope = true;
