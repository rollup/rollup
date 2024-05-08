import type { AstContext, default as Module } from '../../Module';
import { EMPTY_ARRAY } from '../../utils/blank';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createInclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED
} from '../NodeInteractions';
import type ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type SpreadElement from '../nodes/SpreadElement';
import {
	deoptimizeInteraction,
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from '../nodes/shared/Expression';
import type { Node } from '../nodes/shared/Node';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import { EMPTY_PATH, type ObjectPath, type PathTracker, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from './Variable';

export default class LocalVariable extends Variable {
	calledFromTryStatement = false;

	readonly declarations: (Identifier | ExportDefaultDeclaration)[];
	readonly module: Module;
	readonly kind: VariableKind;

	protected additionalInitializers: ExpressionEntity[] | null = null;
	// Caching and deoptimization:
	// We track deoptimization when we do not return something unknown
	protected deoptimizationTracker: PathTracker;
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		private init: ExpressionEntity,
		context: AstContext,
		kind: VariableKind
	) {
		super(name);
		this.declarations = declarator ? [declarator] : [];
		this.deoptimizationTracker = context.deoptimizationTracker;
		this.module = context.module;
		this.kind = kind;
	}

	addDeclaration(identifier: Identifier, init: ExpressionEntity): void {
		this.declarations.push(identifier);
		this.markInitializersForDeoptimization().push(init);
	}

	consolidateInitializers(): void {
		if (this.additionalInitializers) {
			for (const initializer of this.additionalInitializers) {
				initializer.deoptimizePath(UNKNOWN_PATH);
			}
			this.additionalInitializers = null;
		}
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		if (this.isReassigned) {
			deoptimizeInteraction(interaction);
			return;
		}
		recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => this.init.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker),
			undefined
		);
	}

	deoptimizePath(path: ObjectPath): void {
		if (
			this.isReassigned ||
			this.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return;
		}
		if (path.length === 0) {
			this.markReassigned();
			const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
			this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
			this.init.deoptimizePath(UNKNOWN_PATH);
		} else {
			this.init.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned) {
			return UnknownValue;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => {
				this.expressionsToBeDeoptimized.push(origin);
				return this.init.getLiteralValueAtPath(path, recursionTracker, origin);
			},
			UnknownValue
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (this.isReassigned) {
			return UNKNOWN_RETURN_EXPRESSION;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.init,
			() => {
				this.expressionsToBeDeoptimized.push(origin);
				return this.init.getReturnExpressionWhenCalledAtPath(
					path,
					interaction,
					recursionTracker,
					origin
				);
			},
			UNKNOWN_RETURN_EXPRESSION
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		switch (interaction.type) {
			case INTERACTION_ACCESSED: {
				if (this.isReassigned) return true;
				return (
					!context.accessed.trackEntityAtPathAndGetIfTracked(path, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context)
				);
			}
			case INTERACTION_ASSIGNED: {
				if (this.included) return true;
				if (path.length === 0) return false;
				if (this.isReassigned) return true;
				return (
					!context.assigned.trackEntityAtPathAndGetIfTracked(path, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context)
				);
			}
			case INTERACTION_CALLED: {
				if (this.isReassigned) return true;
				return (
					!(
						interaction.withNew ? context.instantiated : context.called
					).trackEntityAtPathAndGetIfTracked(path, interaction.args, this) &&
					this.init.hasEffectsOnInteractionAtPath(path, interaction, context)
				);
			}
		}
	}

	includePath(path?: ObjectPath): void {
		if (!this.included) {
			super.includePath(path);
			for (const declaration of this.declarations) {
				// If node is a default export, it can save a tree-shaking run to include the full declaration now
				if (!declaration.included)
					declaration.includePath(EMPTY_PATH, createInclusionContext(), false);
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
		if (path?.length) {
			this.init.includePath(path, createInclusionContext(), false);
		}
	}

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		if (this.isReassigned || context.includedCallArguments.has(this.init)) {
			for (const argument of parameters) {
				argument.includePath(EMPTY_PATH, context, false);
			}
		} else {
			context.includedCallArguments.add(this.init);
			this.init.includeCallArguments(context, parameters);
			context.includedCallArguments.delete(this.init);
		}
	}

	markCalledFromTryStatement(): void {
		this.calledFromTryStatement = true;
	}

	markInitializersForDeoptimization(): ExpressionEntity[] {
		if (this.additionalInitializers === null) {
			this.additionalInitializers = [this.init];
			this.init = UNKNOWN_EXPRESSION;
			this.markReassigned();
		}
		return this.additionalInitializers;
	}
}
