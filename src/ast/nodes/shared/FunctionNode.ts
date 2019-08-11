import CallOptions from '../../CallOptions';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import FunctionScope from '../../scopes/FunctionScope';
import { ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_KEY, UNKNOWN_PATH } from '../../values';
import BlockStatement from '../BlockStatement';
import Identifier, { IdentifierWithVariable } from '../Identifier';
import RestElement from '../RestElement';
import SpreadElement from '../SpreadElement';
import { ExpressionNode, GenericEsTreeNode, NodeBase } from './Node';
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
			} else if (path[0] === UNKNOWN_KEY) {
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

	hasEffects(options: ExecutionPathOptions) {
		return this.id !== null && this.id.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		if (path.length <= 1) {
			return false;
		}
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
		options: ExecutionPathOptions
	) {
		if (path.length > 0) {
			return true;
		}
		const innerOptions = this.scope.getOptionsWhenCalledWith(callOptions, options);
		for (const param of this.params) {
			if (param.hasEffects(innerOptions)) return true;
		}
		return this.body.hasEffects(innerOptions);
	}

	include(includeChildrenRecursively: boolean | 'variables') {
		this.included = true;
		this.body.include(includeChildrenRecursively);
		if (this.id) {
			this.id.include();
		}
		const hasArguments = this.scope.argumentsVariable.included;
		for (const param of this.params) {
			if (!(param instanceof Identifier) || hasArguments) {
				param.include(includeChildrenRecursively);
			}
		}
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		this.scope.includeCallArguments(args);
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
