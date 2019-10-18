import { CallOptions } from '../../CallOptions';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import FunctionScope from '../../scopes/FunctionScope';
import { ObjectPath, UNKNOWN_PATH, UnknownKey } from '../../utils/PathTracker';
import { UNKNOWN_EXPRESSION, UnknownObjectExpression } from '../../values';
import BlockStatement from '../BlockStatement';
import Identifier, { IdentifierWithVariable } from '../Identifier';
import RestElement from '../RestElement';
import SpreadElement from '../SpreadElement';
import { ExpressionNode, GenericEsTreeNode, IncludeChildren, NodeBase } from './Node';
import { PatternNode } from './Pattern';

export default class FunctionNode extends NodeBase {
	async!: boolean;
	body!: BlockStatement;
	id!: IdentifierWithVariable | null;
	params!: PatternNode[];
	preventChildBlockScope!: true;
	scope!: FunctionScope;

	private isPrototypeDeoptimized = false;

	createScope(parentScope: FunctionScope) {
		this.scope = new FunctionScope(parentScope, this.context);
	}

	deoptimizePath(path: ObjectPath) {
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

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		return path.length === 0 ? this.scope.getReturnExpression() : UNKNOWN_EXPRESSION;
	}

	hasEffects() {
		return this.id !== null && this.id.hasEffects();
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		if (path.length <= 1) return false;
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeDeoptimized;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		if (path.length <= 1) {
			return false;
		}
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeDeoptimized;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (path.length > 0) return true;
		for (const param of this.params) {
			if (param.hasEffects(context)) return true;
		}
		const thisInit = context.replacedVariableInits.get(this.scope.thisVariable);
		context.replacedVariableInits.set(
			this.scope.thisVariable,
			callOptions.withNew ? new UnknownObjectExpression() : UNKNOWN_EXPRESSION
		);
		const { brokenFlow, ignore } = context;
		context.ignore = {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnAwaitYield: true
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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (this.id) this.id.include(context);
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

	initialise() {
		if (this.id !== null) {
			this.id.declare('function', this);
		}
		this.scope.addParameterVariables(
			this.params.map(param => param.declare('parameter', UNKNOWN_EXPRESSION)),
			this.params[this.params.length - 1] instanceof RestElement
		);
		this.body.addImplicitReturnExpressionToScope();
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.body = new this.context.nodeConstructors.BlockStatement(
			esTreeNode.body,
			this,
			this.scope.hoistedBodyVarScope
		) as BlockStatement;
		super.parseNode(esTreeNode);
	}
}

FunctionNode.prototype.preventChildBlockScope = true;
