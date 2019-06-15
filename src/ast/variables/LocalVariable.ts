import Module, { AstContext } from '../../Module';
import { markModuleAndImpureDependenciesAsExecuted } from '../../utils/traverseStaticDependencies';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { ExpressionNode, Node } from '../nodes/shared/Node';
import SpreadElement from '../nodes/SpreadElement';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import { ImmutableEntityPathTracker } from '../utils/ImmutableEntityPathTracker';
import {
	LiteralValueOrUnknown,
	ObjectPath,
	UNKNOWN_EXPRESSION,
	UNKNOWN_PATH,
	UNKNOWN_VALUE
} from '../values';
import Variable from './Variable';

// To avoid infinite recursions
const MAX_PATH_DEPTH = 7;

export default class LocalVariable extends Variable {
	additionalInitializers: ExpressionEntity[] | null = null;
	calledFromTryStatement = false;
	declarations: (Identifier | ExportDefaultDeclaration)[];
	init: ExpressionEntity | null;
	module: Module;

	// Caching and deoptimization:
	// We track deoptimization when we do not return something unknown
	private deoptimizationTracker: EntityPathTracker;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		init: ExpressionEntity | null,
		context: AstContext
	) {
		super(name);
		this.declarations = declarator ? [declarator] : [];
		this.init = init;
		this.deoptimizationTracker = context.deoptimizationTracker;
		this.module = context.module;
	}

	addDeclaration(identifier: Identifier, init: ExpressionEntity | null) {
		this.declarations.push(identifier);
		if (this.additionalInitializers === null) {
			this.additionalInitializers = this.init === null ? [] : [this.init];
			this.init = UNKNOWN_EXPRESSION;
			this.isReassigned = true;
		}
		if (init !== null) {
			this.additionalInitializers.push(init);
		}
	}

	consolidateInitializers() {
		if (this.additionalInitializers !== null) {
			for (const initializer of this.additionalInitializers) {
				initializer.deoptimizePath(UNKNOWN_PATH);
			}
			this.additionalInitializers = null;
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length > MAX_PATH_DEPTH) return;
		if (!(this.isReassigned || this.deoptimizationTracker.track(this, path))) {
			if (path.length === 0) {
				if (!this.isReassigned) {
					this.isReassigned = true;
					for (const expression of this.expressionsToBeDeoptimized) {
						expression.deoptimizeCache();
					}
					if (this.init) {
						this.init.deoptimizePath(UNKNOWN_PATH);
					}
				}
			} else if (this.init) {
				this.init.deoptimizePath(path);
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (
			this.isReassigned ||
			!this.init ||
			path.length > MAX_PATH_DEPTH ||
			recursionTracker.isTracked(this.init, path)
		) {
			return UNKNOWN_VALUE;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.init.getLiteralValueAtPath(path, recursionTracker.track(this.init, path), origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (
			this.isReassigned ||
			!this.init ||
			path.length > MAX_PATH_DEPTH ||
			recursionTracker.isTracked(this.init, path)
		) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		return this.init.getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker.track(this.init, path),
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		return (
			this.isReassigned ||
			path.length > MAX_PATH_DEPTH ||
			((this.init &&
				!options.hasNodeBeenAccessedAtPath(path, this.init) &&
				this.init.hasEffectsWhenAccessedAtPath(
					path,
					options.addAccessedNodeAtPath(path, this.init)
				)) as boolean)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (this.included || path.length > MAX_PATH_DEPTH) return true;
		if (path.length === 0) return false;
		return (
			this.isReassigned ||
			((this.init &&
				!options.hasNodeBeenAssignedAtPath(path, this.init) &&
				this.init.hasEffectsWhenAssignedAtPath(
					path,
					options.addAssignedNodeAtPath(path, this.init)
				)) as boolean)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (path.length > MAX_PATH_DEPTH) return true;
		return (
			this.isReassigned ||
			((this.init &&
				!options.hasNodeBeenCalledAtPathWithOptions(path, this.init, callOptions) &&
				this.init.hasEffectsWhenCalledAtPath(
					path,
					callOptions,
					options.addCalledNodeAtPathWithOptions(path, this.init, callOptions)
				)) as boolean)
		);
	}

	include() {
		if (!this.included) {
			this.included = true;
			if (!this.module.isExecuted) {
				markModuleAndImpureDependenciesAsExecuted(this.module);
			}
			for (const declaration of this.declarations) {
				// If node is a default export, it can save a tree-shaking run to include the full declaration now
				if (!declaration.included) declaration.include(false);
				let node = declaration.parent as Node;
				while (!node.included) {
					// We do not want to properly include parents in case they are part of a dead branch
					// in which case .include() might pull in more dead code
					node.included = true;
					if (node.type === NodeType.Program) break;
					node = node.parent as Node;
				}
			}
		}
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		if (this.isReassigned) {
			for (const arg of args) {
				arg.include(false);
			}
		} else if (this.init) {
			this.init.includeCallArguments(args);
		}
	}

	markCalledFromTryStatement() {
		this.calledFromTryStatement = true;
	}
}
