import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { CallOptions, NO_ARGS } from '../CallOptions';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import ReturnValueScope from '../scopes/ReturnValueScope';
import Scope from '../scopes/Scope';
import { ObjectPath, UNKNOWN_PATH, UnknownKey } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import RestElement from './RestElement';
import SpreadElement from './SpreadElement';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { ExpressionNode, GenericEsTreeNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ArrowFunctionExpression extends NodeBase {
	declare async: boolean;
	declare body: BlockStatement | ExpressionNode;
	declare params: PatternNode[];
	declare preventChildBlockScope: true;
	declare scope: ReturnValueScope;
	declare type: NodeType.tArrowFunctionExpression;
	private deoptimizedReturn = false;

	createScope(parentScope: Scope): void {
		this.scope = new ReturnValueScope(parentScope, this.context);
	}

	deoptimizePath(path: ObjectPath): void {
		// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
		// which means the return expression needs to be reassigned
		if (path.length === 1 && path[0] === UnknownKey) {
			this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
		}
	}

	// Arrow functions do not mutate their context
	deoptimizeThisOnEventAtPath(): void {}

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
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		_callOptions: CallOptions,
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
		const { ignore, brokenFlow } = context;
		context.ignore = {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnYield: true
		};
		if (this.body.hasEffects(context)) return true;
		context.ignore = ignore;
		context.brokenFlow = brokenFlow;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		for (const param of this.params) {
			if (!(param instanceof Identifier)) {
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
		this.scope.addParameterVariables(
			this.params.map(param => param.declare('parameter', UNKNOWN_EXPRESSION)),
			this.params[this.params.length - 1] instanceof RestElement
		);
		if (this.body instanceof BlockStatement) {
			this.body.addImplicitReturnExpressionToScope();
		} else {
			this.scope.addReturnExpression(this.body);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		if (esTreeNode.body.type === NodeType.BlockStatement) {
			this.body = new BlockStatement(esTreeNode.body, this, this.scope.hoistedBodyVarScope);
		}
		super.parseNode(esTreeNode);
	}
}

ArrowFunctionExpression.prototype.preventChildBlockScope = true;
