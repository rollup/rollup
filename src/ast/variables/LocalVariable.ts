import Module, { AstContext } from '../../Module';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { createInclusionContext, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from '../nodes/shared/Expression';
import { ExpressionNode, Node } from '../nodes/shared/Node';
import SpreadElement from '../nodes/SpreadElement';
import { ObjectPath, PathTracker, UNKNOWN_PATH } from '../utils/PathTracker';
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
	protected deoptimizationTracker: PathTracker;
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
		if (
			path.length > MAX_PATH_DEPTH ||
			this.isReassigned ||
			this.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return;
		}
		if (path.length === 0) {
			if (!this.isReassigned) {
				this.isReassigned = true;
				const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
				this.expressionsToBeDeoptimized = [];
				for (const expression of expressionsToBeDeoptimized) {
					expression.deoptimizeCache();
				}
				this.init?.deoptimizePath(UNKNOWN_PATH);
			}
		} else {
			this.init?.deoptimizePath(path);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (this.isReassigned || !this.init || path.length > MAX_PATH_DEPTH) {
			return thisParameter.deoptimizePath(UNKNOWN_PATH);
		}
		recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => this.init!.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker),
			undefined
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned || !this.init || path.length > MAX_PATH_DEPTH) {
			return UnknownValue;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => {
				this.expressionsToBeDeoptimized.push(origin);
				return this.init!.getLiteralValueAtPath(path, recursionTracker, origin);
			},
			UnknownValue
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.isReassigned || !this.init || path.length > MAX_PATH_DEPTH) {
			return UNKNOWN_EXPRESSION;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => {
				this.expressionsToBeDeoptimized.push(origin);
				return this.init!.getReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					recursionTracker,
					origin
				);
			},
			UNKNOWN_EXPRESSION
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (this.isReassigned || path.length > MAX_PATH_DEPTH) return true;
		return (this.init &&
			!context.accessed.trackEntityAtPathAndGetIfTracked(path, this) &&
			this.init.hasEffectsWhenAccessedAtPath(path, context))!;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext) {
		if (this.included || path.length > MAX_PATH_DEPTH) return true;
		if (path.length === 0) return false;
		if (this.isReassigned) return true;
		return (this.init &&
			!context.accessed.trackEntityAtPathAndGetIfTracked(path, this) &&
			this.init.hasEffectsWhenAssignedAtPath(path, context))!;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		if (path.length > MAX_PATH_DEPTH || this.isReassigned) return true;
		return (this.init &&
			!(callOptions.withNew
				? context.instantiated
				: context.called
			).trackEntityAtPathAndGetIfTracked(path, callOptions, this) &&
			this.init.hasEffectsWhenCalledAtPath(path, callOptions, context))!;
	}

	include() {
		if (!this.included) {
			this.included = true;
			for (const declaration of this.declarations) {
				// If node is a default export, it can save a tree-shaking run to include the full declaration now
				if (!declaration.included) declaration.include(createInclusionContext(), false);
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
		if (this.isReassigned || (this.init && context.includedCallArguments.has(this.init))) {
			for (const arg of args) {
				arg.include(context, false);
			}
		} else if (this.init) {
			context.includedCallArguments.add(this.init);
			this.init.includeCallArguments(context, args);
			context.includedCallArguments.delete(this.init);
		}
	}

	markCalledFromTryStatement() {
		this.calledFromTryStatement = true;
	}
}
