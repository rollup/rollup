import { NormalizedTreeshakingOptions } from '../../../rollup/types';
import { CallOptions, NO_ARGS } from '../../CallOptions';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { EVENT_CALLED, NodeEvent } from '../../NodeEvents';
import FunctionScope from '../../scopes/FunctionScope';
import { ObjectPath, UNKNOWN_PATH, UnknownKey } from '../../utils/PathTracker';
import BlockStatement from '../BlockStatement';
import Identifier, { IdentifierWithVariable } from '../Identifier';
import RestElement from '../RestElement';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './Expression';
import { ExpressionNode, GenericEsTreeNode, IncludeChildren, NodeBase } from './Node';
import { ObjectEntity } from './ObjectEntity';
import { OBJECT_PROTOTYPE } from './ObjectPrototype';
import { PatternNode } from './Pattern';

export default class FunctionNode extends NodeBase {
	declare async: boolean;
	declare body: BlockStatement;
	declare id: IdentifierWithVariable | null;
	declare params: PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: FunctionScope;
	private deoptimizedReturn = false;
	private isPrototypeDeoptimized = false;

	createScope(parentScope: FunctionScope): void {
		this.scope = new FunctionScope(parentScope, this.context);
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 1) {
			if (path[0] === 'prototype') {
				this.isPrototypeDeoptimized = true;
			} else if (path[0] === UnknownKey) {
				this.isPrototypeDeoptimized = true;

				// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
				// which means the return expression needs to be reassigned as well
				this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	// TODO for completeness, we should also track other events here
	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity
	): void {
		if (event === EVENT_CALLED) {
			if (path.length > 0) {
				thisParameter.deoptimizePath(UNKNOWN_PATH);
			} else {
				this.scope.thisVariable.addEntityToBeDeoptimized(thisParameter);
			}
		}
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
		if (path.length !== 0) {
			return UNKNOWN_EXPRESSION;
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

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		if (path.length <= 1) return false;
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeDeoptimized;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath): boolean {
		if (path.length <= 1) {
			return false;
		}
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeDeoptimized;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0) return true;
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

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
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
}

FunctionNode.prototype.preventChildBlockScope = true;
