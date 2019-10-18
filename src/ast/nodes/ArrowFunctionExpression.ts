import { CallOptions } from '../CallOptions';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import ReturnValueScope from '../scopes/ReturnValueScope';
import Scope from '../scopes/Scope';
import { ObjectPath, UNKNOWN_PATH, UnknownKey } from '../utils/PathTracker';
import { UNKNOWN_EXPRESSION } from '../values';
import BlockStatement from './BlockStatement';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import RestElement from './RestElement';
import { ExpressionNode, GenericEsTreeNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';
import SpreadElement from './SpreadElement';

export default class ArrowFunctionExpression extends NodeBase {
	body!: BlockStatement | ExpressionNode;
	params!: PatternNode[];
	preventChildBlockScope!: true;
	scope!: ReturnValueScope;
	type!: NodeType.tArrowFunctionExpression;

	createScope(parentScope: Scope) {
		this.scope = new ReturnValueScope(parentScope, this.context);
	}

	deoptimizePath(path: ObjectPath) {
		// A reassignment of UNKNOWN_PATH is considered equivalent to having lost track
		// which means the return expression needs to be reassigned
		if (path.length === 1 && path[0] === UnknownKey) {
			this.scope.getReturnExpression().deoptimizePath(UNKNOWN_PATH);
		}
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		return path.length === 0 ? this.scope.getReturnExpression() : UNKNOWN_EXPRESSION;
	}

	hasEffects() {
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		_callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0) return true;
		for (const param of this.params) {
			if (param.hasEffects(context)) return true;
		}
		const { ignore, brokenFlow } = context;
		context.ignore = {
			breaks: false,
			continues: false,
			labels: new Set(),
			returnAwaitYield: true
		};
		if (this.body.hasEffects(context)) return true;
		context.ignore = ignore;
		context.brokenFlow = brokenFlow;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
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

	initialise() {
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

	parseNode(esTreeNode: GenericEsTreeNode) {
		if (esTreeNode.body.type === NodeType.BlockStatement) {
			this.body = new this.context.nodeConstructors.BlockStatement(
				esTreeNode.body,
				this,
				this.scope.hoistedBodyVarScope
			);
		}
		super.parseNode(esTreeNode);
	}
}

ArrowFunctionExpression.prototype.preventChildBlockScope = true;
