import Scope from '../scopes/Scope';
import ReturnValueScope from '../scopes/ReturnValueScope';
import BlockStatement, { isBlockStatement } from './BlockStatement';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ExpressionNode, GenericEsTreeNode, NodeBase } from './shared/Node';
import { ObjectPath } from '../values';

export default class ArrowFunctionExpression extends NodeBase {
	type: NodeType.ArrowFunctionExpression;
	body: BlockStatement | ExpressionNode;
	params: PatternNode[];

	scope: ReturnValueScope;
	preventChildBlockScope: true;

	bind() {
		super.bind();
		isBlockStatement(this.body)
			? this.body.bindImplicitReturnExpressionToScope()
			: this.scope.addReturnExpression(this.body);
	}

	createScope(parentScope: Scope) {
		this.scope = new ReturnValueScope({ parent: parentScope });
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		path.length === 0 &&
			this.scope.forEachReturnExpressionWhenCalled(callOptions, callback, options);
	}

	hasEffects(_options: ExecutionPathOptions) {
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		_callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length > 0) {
			return true;
		}
		for (const param of this.params) {
			if (param.hasEffects(options)) return true;
		}
		return this.body.hasEffects(options);
	}

	initialise() {
		this.included = false;
		for (const param of this.params) {
			param.declare('parameter', null);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		if (esTreeNode.body.type === NodeType.BlockStatement) {
			this.body = new this.context.nodeConstructors.BlockStatement(
				esTreeNode.body,
				this,
				new Scope({ parent: this.scope })
			);
		}
		super.parseNode(esTreeNode);
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return (
			path.length > 0 ||
			this.scope.someReturnExpressionWhenCalled(callOptions, predicateFunction, options)
		);
	}
}

ArrowFunctionExpression.prototype.preventChildBlockScope = true;
