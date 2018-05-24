import FunctionScope from '../../scopes/FunctionScope';
import BlockScope from '../../scopes/FunctionScope';
import BlockStatement from '../BlockStatement';
import Identifier from '../Identifier';
import CallOptions from '../../CallOptions';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
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
	preventChildBlockScope: true;

	private isPrototypeReassigned: boolean;

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
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeReassigned;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		if (path.length <= 1) {
			return false;
		}
		return path.length > 2 || path[0] !== 'prototype' || this.isPrototypeReassigned;
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
		super.include();
	}

	initialise() {
		this.included = false;
		this.isPrototypeReassigned = false;
		if (this.id !== null) {
			this.id.declare('function', this);
		}
		for (const param of this.params) {
			param.declare('parameter', null);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.body = <BlockStatement>new this.context.nodeConstructors.BlockStatement(
			esTreeNode.body,
			this,
			new Scope({ parent: this.scope })
		);
		super.parseNode(esTreeNode);
	}

	reassignPath(path: ObjectPath) {
		if (path.length === 1 && path[0] === 'prototype') {
			this.isPrototypeReassigned = true;
		}
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

FunctionNode.prototype.preventChildBlockScope = true;
