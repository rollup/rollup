import Module, { AstContext } from '../../Module';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import { createInclusionContext, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteractionCalled, NodeInteractionWithThisArg } from '../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NodeInteraction
} from '../NodeInteractions';
import type ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type SpreadElement from '../nodes/SpreadElement';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from '../nodes/shared/Expression';
import type { Node } from '../nodes/shared/Node';
import { type ObjectPath, type PathTracker, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from './Variable';

export default class LocalVariable extends Variable {
	calledFromTryStatement = false;
	readonly declarations: (Identifier | ExportDefaultDeclaration)[];
	init: ExpressionEntity | null;
	readonly module: Module;

	// Caching and deoptimization:
	// We track deoptimization when we do not return something unknown
	protected deoptimizationTracker: PathTracker;
	private additionalInitializers: ExpressionEntity[] | null = null;
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

	addDeclaration(identifier: Identifier, init: ExpressionEntity | null): void {
		this.declarations.push(identifier);
		const additionalInitializers = this.markInitializersForDeoptimization();
		if (init !== null) {
			additionalInitializers.push(init);
		}
	}

	consolidateInitializers(): void {
		if (this.additionalInitializers !== null) {
			for (const initializer of this.additionalInitializers) {
				initializer.deoptimizePath(UNKNOWN_PATH);
			}
			this.additionalInitializers = null;
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (
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

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		if (this.isReassigned || !this.init) {
			return interaction.thisArg.deoptimizePath(UNKNOWN_PATH);
		}
		recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => this.init!.deoptimizeThisOnInteractionAtPath(interaction, path, recursionTracker),
			undefined
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned || !this.init) {
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
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.isReassigned || !this.init) {
			return UNKNOWN_EXPRESSION;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => {
				this.expressionsToBeDeoptimized.push(origin);
				return this.init!.getReturnExpressionWhenCalledAtPath(
					path,
					interaction,
					recursionTracker,
					origin
				);
			},
			UNKNOWN_EXPRESSION
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		switch (interaction.type) {
			case INTERACTION_ACCESSED:
				if (this.isReassigned) return true;
				return (this.init &&
					!context.accessed.trackEntityAtPathAndGetIfTracked(path, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context))!;
			case INTERACTION_ASSIGNED:
				if (this.included) return true;
				if (path.length === 0) return false;
				if (this.isReassigned) return true;
				return (this.init &&
					!context.assigned.trackEntityAtPathAndGetIfTracked(path, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context))!;
			case INTERACTION_CALLED:
				if (this.isReassigned) return true;
				return (this.init &&
					!(
						interaction.withNew ? context.instantiated : context.called
					).trackEntityAtPathAndGetIfTracked(path, interaction.args, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context))!;
		}
	}

	include(): void {
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

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionEntity | SpreadElement)[]
	): void {
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

	markCalledFromTryStatement(): void {
		this.calledFromTryStatement = true;
	}

	markInitializersForDeoptimization(): ExpressionEntity[] {
		if (this.additionalInitializers === null) {
			this.additionalInitializers = this.init === null ? [] : [this.init];
			this.init = UNKNOWN_EXPRESSION;
			this.isReassigned = true;
		}
		return this.additionalInitializers;
	}
}
