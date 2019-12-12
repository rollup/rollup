import Module, { AstContext } from '../../Module';
import { markModuleAndImpureDependenciesAsExecuted } from '../../utils/traverseStaticDependencies';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { ExpressionNode, Node } from '../nodes/shared/Node';
import SpreadElement from '../nodes/SpreadElement';
import { ObjectPath, PathTracker, UNKNOWN_PATH } from '../utils/PathTracker';
import { LiteralValueOrUnknown, UNKNOWN_EXPRESSION, UnknownValue } from '../values';
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
	private deoptimizationTracker: PathTracker;
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
		if (path.length > MAX_PATH_DEPTH || this.isReassigned) return;
		const trackedEntities = this.deoptimizationTracker.getEntities(path);
		if (trackedEntities.has(this)) return;
		trackedEntities.add(this);
		if (path.length === 0) {
			if (!this.isReassigned) {
				this.isReassigned = true;
				const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
				this.expressionsToBeDeoptimized = [];
				for (const expression of expressionsToBeDeoptimized) {
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

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned || !this.init || path.length > MAX_PATH_DEPTH) {
			return UnknownValue;
		}
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(this.init)) {
			return UnknownValue;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(this.init);
		const value = this.init.getLiteralValueAtPath(path, recursionTracker, origin);
		trackedEntities.delete(this.init);
		return value;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.isReassigned || !this.init || path.length > MAX_PATH_DEPTH) {
			return UNKNOWN_EXPRESSION;
		}
		const trackedEntities = recursionTracker.getEntities(path);
		if (trackedEntities.has(this.init)) {
			return UNKNOWN_EXPRESSION;
		}
		this.expressionsToBeDeoptimized.push(origin);
		trackedEntities.add(this.init);
		const value = this.init.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		trackedEntities.delete(this.init);
		return value;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (path.length === 0) return false;
		if (this.isReassigned || path.length > MAX_PATH_DEPTH) return true;
		const trackedExpressions = context.accessed.getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return (this.init && this.init.hasEffectsWhenAccessedAtPath(path, context)) as boolean;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (this.included || path.length > MAX_PATH_DEPTH) return true;
		if (path.length === 0) return false;
		if (this.isReassigned) return true;
		const trackedExpressions = context.assigned.getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return (this.init && this.init.hasEffectsWhenAssignedAtPath(path, context)) as boolean;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (path.length > MAX_PATH_DEPTH || this.isReassigned) return true;
		const trackedExpressions = (callOptions.withNew
			? context.instantiated
			: context.called
		).getEntities(path);
		if (trackedExpressions.has(this)) return false;
		trackedExpressions.add(this);
		return (this.init &&
			this.init.hasEffectsWhenCalledAtPath(path, callOptions, context)) as boolean;
	}

	include(context: InclusionContext) {
		if (!this.included) {
			this.included = true;
			if (!this.module.isExecuted) {
				markModuleAndImpureDependenciesAsExecuted(this.module);
			}
			for (const declaration of this.declarations) {
				// If node is a default export, it can save a tree-shaking run to include the full declaration now
				if (!declaration.included) declaration.include(context, false);
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

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		if (this.isReassigned) {
			for (const arg of args) {
				arg.include(context, false);
			}
		} else if (this.init) {
			this.init.includeCallArguments(context, args);
		}
	}

	markCalledFromTryStatement() {
		this.calledFromTryStatement = true;
	}
}
