import FunctionScope from '../../scopes/FunctionScope';
import BlockScope from '../../scopes/FunctionScope';
import BlockStatement from '../BlockStatement';
import Identifier from '../Identifier';
import CallOptions from '../../CallOptions';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import { PatternNode } from './Pattern';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './Expression';
import { GenericEsTreeNode, NodeBase } from './Node';
import { ObjectPath } from '../../values';
import Scope from '../../scopes/Scope';

export default class FunctionNode extends NodeBase {
	id: Identifier | null;
	body: BlockStatement;
	params: PatternNode[];

	scope: BlockScope;

	bind() {
		super.bind();
		this.body.bindImplicitReturnExpressionToScope();
	}

	createScope(parentScope: FunctionScope) {
		this.scope = new FunctionScope({ parent: parentScope });
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

	hasEffects(options: ExecutionPathOptions) {
		return this.id && this.id.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		if (path.length <= 1) {
			return false;
		}
		if (path[0] === 'prototype') {
			return path.length > 2;
		}
		return true;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		if (path.length <= 1) {
			return false;
		}
		if (path[0] === 'prototype') {
			return path.length > 2;
		}
		return true;
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

	include() {
		this.scope.variables.arguments.include();
		return super.include();
	}

	initialise() {
		if (this.id !== null) {
			this.id.declare('function', this);
		}
		for (const param of this.params) {
			param.declare('parameter', null);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode, nodeConstructors: { [p: string]: typeof NodeBase }) {
		this.body = <BlockStatement>new nodeConstructors.BlockStatement(
			esTreeNode.body,
			nodeConstructors,
			this,
			new Scope({ parent: this.scope }),
			true
		);
		super.parseNode(esTreeNode, nodeConstructors);
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
