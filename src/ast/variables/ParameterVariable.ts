import type { AstContext } from '../../Module';
import { EMPTY_ARRAY } from '../../utils/blank';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import { createInclusionContext, type HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ASSIGNED, INTERACTION_CALLED } from '../NodeInteractions';
import type ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import type { ExpressionEntity, LiteralValueOrUnknown } from '../nodes/shared/Expression';
import {
	deoptimizeInteraction,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from '../nodes/shared/Expression';
import type { ObjectPath, ObjectPathKey } from '../utils/PathTracker';
import {
	EMPTY_PATH,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface DeoptimizationInteraction {
	interaction: NodeInteraction;
	path: ObjectPath;
}

const MAX_TRACKED_INTERACTIONS = 20;
const NO_INTERACTIONS = EMPTY_ARRAY as unknown as DeoptimizationInteraction[];
const UNKNOWN_DEOPTIMIZED_FIELD = new Set<ObjectPathKey>([UnknownKey]);
const EMPTY_PATH_TRACKER = new PathTracker();
const UNKNOWN_DEOPTIMIZED_ENTITY = new Set<ExpressionEntity>([UNKNOWN_EXPRESSION]);

export default class ParameterVariable extends LocalVariable {
	private deoptimizationInteractions: DeoptimizationInteraction[] = [];
	private deoptimizations = new PathTracker();
	private deoptimizedFields = new Set<ObjectPathKey>();
	private entitiesToBeDeoptimized = new Set<ExpressionEntity>();
	private expressionsUseTheKnownValue: DeoptimizableEntity[] = [];

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		context: AstContext
	) {
		super(name, declarator, UNKNOWN_EXPRESSION, context, 'parameter');
	}

	addEntityToBeDeoptimized(entity: ExpressionEntity): void {
		if (entity === UNKNOWN_EXPRESSION) {
			// As unknown expressions fully deoptimize all interactions, we can clear
			// the interaction cache at this point provided we keep this optimization
			// in mind when adding new interactions
			if (!this.entitiesToBeDeoptimized.has(UNKNOWN_EXPRESSION)) {
				this.entitiesToBeDeoptimized.add(UNKNOWN_EXPRESSION);
				for (const { interaction } of this.deoptimizationInteractions) {
					deoptimizeInteraction(interaction);
				}
				this.deoptimizationInteractions = NO_INTERACTIONS;
			}
		} else if (this.deoptimizedFields.has(UnknownKey)) {
			// This means that we already deoptimized all interactions and no longer
			// track them
			entity.deoptimizePath(UNKNOWN_PATH);
		} else if (!this.entitiesToBeDeoptimized.has(entity)) {
			this.entitiesToBeDeoptimized.add(entity);
			for (const field of this.deoptimizedFields) {
				entity.deoptimizePath([field]);
			}
			for (const { interaction, path } of this.deoptimizationInteractions) {
				entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
			}
		}
	}

	markReassigned(): void {
		if (this.isReassigned) {
			return;
		}
		super.markReassigned();
		for (const expression of this.expressionsUseTheKnownValue) {
			expression.deoptimizeCache();
		}
		this.expressionsUseTheKnownValue = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
	}

	deoptimizeCache(): void {
		this.markReassigned();
	}

	private knownValue: ExpressionEntity | null = null;
	private knownValueLiteral: LiteralValueOrUnknown = UnknownValue;
	/**
	 * Update the known value of the parameter variable.
	 * Must be called for every function call, so it can track all the arguments,
	 * and deoptimizeCache itself to mark reassigned if the argument is changed.
	 * @param argument The argument of the function call
	 */
	updateKnownValue(argument: ExpressionEntity) {
		if (this.isReassigned) {
			return;
		}

		if (this.knownValue === null) {
			this.knownValue = argument;
			this.knownValueLiteral = argument.getLiteralValueAtPath(
				EMPTY_PATH,
				SHARED_RECURSION_TRACKER,
				this
			);
			return;
		}

		// the same literal or identifier, do nothing
		if (
			this.knownValue === argument ||
			(this.knownValue instanceof Identifier &&
				argument instanceof Identifier &&
				this.knownValue.variable === argument.variable)
		) {
			return;
		}

		const oldValue = this.knownValueLiteral;
		if (typeof oldValue === 'symbol') {
			this.markReassigned();
			return;
		}
		// add tracking for the new argument
		const newValue = argument.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
		if (newValue !== oldValue) {
			this.markReassigned();
		}
	}

	private frozenValue: ExpressionEntity | null = null;
	/**
	 * This function freezes the known value of the parameter variable,
	 * so the optimization starts with a certain ExpressionEntity.
	 * The optimization can be undone by calling `markReassigned`.
	 * @returns the frozen value
	 */
	private getKnownValue(): ExpressionEntity {
		if (this.frozenValue === null) {
			this.frozenValue = this.knownValue || UNKNOWN_EXPRESSION;
		}
		return this.frozenValue;
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned) {
			return UnknownValue;
		}
		const knownValue = this.getKnownValue();
		this.expressionsUseTheKnownValue.push(origin);
		return recursionTracker.withTrackedEntityAtPath(
			path,
			knownValue,
			() => knownValue.getLiteralValueAtPath(path, recursionTracker, origin),
			UnknownValue
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (this.isReassigned || interaction.type === INTERACTION_ASSIGNED) {
			return super.hasEffectsOnInteractionAtPath(path, interaction, context);
		}
		const knownValue = this.getKnownValue();
		return knownValue.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	includePath(path?: ObjectPath): void {
		super.includePath(path);
		if (this.knownValue && path) {
			this.knownValue.includePath(path, createInclusionContext(), false);
		}
	}

	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
		// For performance reasons, we fully deoptimize all deeper interactions
		if (
			path.length >= 2 ||
			this.entitiesToBeDeoptimized.has(UNKNOWN_EXPRESSION) ||
			this.deoptimizationInteractions.length >= MAX_TRACKED_INTERACTIONS ||
			(path.length === 1 &&
				(this.deoptimizedFields.has(UnknownKey) ||
					(interaction.type === INTERACTION_CALLED && this.deoptimizedFields.has(path[0]))))
		) {
			deoptimizeInteraction(interaction);
			return;
		}
		if (!this.deoptimizations.trackEntityAtPathAndGetIfTracked(path, interaction.args)) {
			for (const entity of this.entitiesToBeDeoptimized) {
				entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
			}
			if (!this.entitiesToBeDeoptimized.has(UNKNOWN_EXPRESSION)) {
				this.deoptimizationInteractions.push({
					interaction,
					path
				});
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			this.markReassigned();
			return;
		}
		if (this.deoptimizedFields.has(UnknownKey)) {
			return;
		}
		const key = path[0];
		if (this.deoptimizedFields.has(key)) {
			return;
		}
		this.deoptimizedFields.add(key);
		for (const entity of this.entitiesToBeDeoptimized) {
			// We do not need a recursion tracker here as we already track whether
			// this field is deoptimized
			entity.deoptimizePath([key]);
		}
		if (key === UnknownKey) {
			// save some memory
			this.deoptimizationInteractions = NO_INTERACTIONS;
			this.deoptimizations = EMPTY_PATH_TRACKER;
			this.deoptimizedFields = UNKNOWN_DEOPTIMIZED_FIELD;
			this.entitiesToBeDeoptimized = UNKNOWN_DEOPTIMIZED_ENTITY;
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath
	): [expression: ExpressionEntity, isPure: boolean] {
		// We deoptimize everything that is called as that will trivially deoptimize
		// the corresponding return expressions as well and avoid badly performing
		// and complicated alternatives
		if (path.length === 0) {
			this.deoptimizePath(UNKNOWN_PATH);
		} else if (!this.deoptimizedFields.has(path[0])) {
			this.deoptimizePath([path[0]]);
		}
		return UNKNOWN_RETURN_EXPRESSION;
	}
}
