import CallOptions from '../../CallOptions';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import FunctionScope from '../../scopes/FunctionScope';
import BlockScope from '../../scopes/FunctionScope';
import { ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_KEY, UNKNOWN_PATH } from '../../values';
import BlockStatement from '../BlockStatement';
import Identifier from '../Identifier';
import { GenericEsTreeNode, NodeBase } from './Node';
import { PatternNode } from './Pattern';

export default class FunctionNode extends NodeBase {
	id: Identifier | null;
	body: BlockStatement;
	params: PatternNode[];
	async: boolean;

	scope: BlockScope;
	preventChildBlockScope: true;

	private isPrototypeDeoptimized: boolean;

	createScope(parentScope: FunctionScope) {
		this.scope = new FunctionScope(parentScope, this.context);
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath) {
		return path.length === 0 ? this.scope.getReturnExpression() : UNKNOWN_EXPRESSION;
	}

	hasEffects(options: ExecutionPathOptions) {
		return this.id && this.id.hasEffects(options);
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

	include(includeAllChildrenRecursively: boolean) {
		this.scope.variables.arguments.include();
		super.include(includeAllChildrenRecursively);
	}

	initialise() {
		this.included = false;
		this.isPrototypeDeoptimized = false;
		if (this.id !== null) {
			this.id.declare('function', this);
		}
		for (const param of this.params) {
			param.declare('parameter', UNKNOWN_EXPRESSION);
		}
		this.body.addImplicitReturnExpressionToScope();
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.body = <BlockStatement>(
			new this.context.nodeConstructors.BlockStatement(
				esTreeNode.body,
				this,
				this.scope.hoistedBodyVarScope
			)
		);
		super.parseNode(esTreeNode);
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
}

FunctionNode.prototype.preventChildBlockScope = true;
