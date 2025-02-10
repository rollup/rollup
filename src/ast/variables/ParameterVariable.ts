import type { AstContext } from '../../Module';
import { EMPTY_ARRAY } from '../../utils/blank';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { InclusionContext } from '../ExecutionContext';
import { type HasEffectsContext } from '../ExecutionContext';
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
import { MAX_PATH_DEPTH } from '../utils/limitPathLength';
import type { ObjectPath, ObjectPathKey } from '../utils/PathTracker';
import {
	EntityPathTracker,
	IncludedTopLevelPathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface TrackedInteraction {
	interaction: NodeInteraction;
	path: ObjectPath;
}

const MAX_TRACKED_INTERACTIONS = 20;
const NO_INTERACTIONS = EMPTY_ARRAY as unknown as TrackedInteraction[];
const UNKNOWN_DEOPTIMIZED_FIELD = new Set<ObjectPathKey>([UnknownKey]);
const EMPTY_PATH_TRACKER = new EntityPathTracker();
const UNKNOWN_DEOPTIMIZED_ENTITY = new Set<ExpressionEntity>([UNKNOWN_EXPRESSION]);

export default class ParameterVariable extends LocalVariable {
	protected includedPathTracker = new IncludedTopLevelPathTracker();
	private argumentsToBeDeoptimized = new Set<ExpressionEntity>();
	private deoptimizationInteractions: TrackedInteraction[] = [];
	private deoptimizations = new EntityPathTracker();
	private deoptimizedFields = new Set<ObjectPathKey>();
	private expressionsDependingOnKnownValue: DeoptimizableEntity[] = [];
	private knownValue: ExpressionEntity | null = null;
	private knownValueLiteral: LiteralValueOrUnknown = UnknownValue;

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		argumentPath: ObjectPath,
		context: AstContext
	) {
		super(name, declarator, UNKNOWN_EXPRESSION, argumentPath, context, 'parameter');
	}

	addArgumentForDeoptimization(entity: ExpressionEntity): void {
		this.updateKnownValue(entity);
		if (entity === UNKNOWN_EXPRESSION) {
			// As unknown expressions fully deoptimize all interactions, we can clear
			// the interaction cache at this point provided we keep this optimization
			// in mind when adding new interactions
			if (!this.argumentsToBeDeoptimized.has(UNKNOWN_EXPRESSION)) {
				this.argumentsToBeDeoptimized.add(UNKNOWN_EXPRESSION);
				for (const { interaction } of this.deoptimizationInteractions) {
					deoptimizeInteraction(interaction);
				}
				this.deoptimizationInteractions = NO_INTERACTIONS;
			}
		} else if (this.deoptimizedFields.has(UnknownKey)) {
			// This means that we already deoptimized all interactions and no longer
			// track them
			entity.deoptimizePath([...this.initPath, UnknownKey]);
		} else if (!this.argumentsToBeDeoptimized.has(entity)) {
			this.argumentsToBeDeoptimized.add(entity);
			for (const field of this.deoptimizedFields) {
				entity.deoptimizePath([...this.initPath, field]);
			}
			for (const { interaction, path } of this.deoptimizationInteractions) {
				entity.deoptimizeArgumentsOnInteractionAtPath(
					interaction,
					[...this.initPath, ...path],
					SHARED_RECURSION_TRACKER
				);
			}
		}
	}

	/** This says we should not make assumptions about the value of the parameter.
	 *  This is different from deoptimization that will also cause argument values
	 *  to be deoptimized. */
	markReassigned(): void {
		if (this.isReassigned) {
			return;
		}
		super.markReassigned();
		for (const expression of this.expressionsDependingOnKnownValue) {
			expression.deoptimizeCache();
		}
		this.expressionsDependingOnKnownValue = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
	}

	deoptimizeCache(): void {
		this.markReassigned();
	}

	/**
	 * Update the known value of the parameter variable.
	 * Must be called for every function call, so it can track all the arguments,
	 * and deoptimizeCache itself to mark reassigned if the argument is changed.
	 * @param argument The argument of the function call
	 */
	private updateKnownValue(argument: ExpressionEntity) {
		if (this.isReassigned) {
			return;
		}

		if (this.knownValue === null) {
			this.knownValue = argument;
			this.knownValueLiteral = argument.getLiteralValueAtPath(
				this.initPath,
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

		const { knownValueLiteral } = this;
		if (
			typeof knownValueLiteral === 'symbol' ||
			argument.getLiteralValueAtPath(this.initPath, SHARED_RECURSION_TRACKER, this) !==
				knownValueLiteral
		) {
			this.markReassigned();
		}
	}

	/**
	 * This function freezes the known value of the parameter variable,
	 * so the optimization starts with a certain ExpressionEntity.
	 * The optimization can be undone by calling `markReassigned`.
	 * @returns the frozen value
	 */
	private getKnownValue(): ExpressionEntity {
		return this.knownValue || UNKNOWN_EXPRESSION;
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned || path.length + this.initPath.length > MAX_PATH_DEPTH) {
			return UnknownValue;
		}
		const knownValue = this.getKnownValue();
		this.expressionsDependingOnKnownValue.push(origin);
		return recursionTracker.withTrackedEntityAtPath(
			path,
			knownValue,
			() => knownValue.getLiteralValueAtPath([...this.initPath, ...path], recursionTracker, origin),
			UnknownValue
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const { type } = interaction;
		if (
			this.isReassigned ||
			type === INTERACTION_ASSIGNED ||
			path.length + this.initPath.length > MAX_PATH_DEPTH
		) {
			return super.hasEffectsOnInteractionAtPath(path, interaction, context);
		}
		return (
			!(type === INTERACTION_CALLED
				? (interaction.withNew
						? context.instantiated
						: context.called
					).trackEntityAtPathAndGetIfTracked(path, interaction.args, this)
				: context.accessed.trackEntityAtPathAndGetIfTracked(path, this)) &&
			this.getKnownValue().hasEffectsOnInteractionAtPath(
				[...this.initPath, ...path],
				interaction,
				context
			)
		);
	}

	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
		// For performance reasons, we fully deoptimize all deeper interactions
		if (
			path.length >= 2 ||
			this.argumentsToBeDeoptimized.has(UNKNOWN_EXPRESSION) ||
			this.deoptimizationInteractions.length >= MAX_TRACKED_INTERACTIONS ||
			(path.length === 1 &&
				(this.deoptimizedFields.has(UnknownKey) ||
					(interaction.type === INTERACTION_CALLED && this.deoptimizedFields.has(path[0])))) ||
			this.initPath.length + path.length > MAX_PATH_DEPTH
		) {
			deoptimizeInteraction(interaction);
			return;
		}
		if (!this.deoptimizations.trackEntityAtPathAndGetIfTracked(path, interaction.args)) {
			for (const entity of this.argumentsToBeDeoptimized) {
				entity.deoptimizeArgumentsOnInteractionAtPath(
					interaction,
					[...this.initPath, ...path],
					SHARED_RECURSION_TRACKER
				);
			}
			if (!this.argumentsToBeDeoptimized.has(UNKNOWN_EXPRESSION)) {
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
		for (const entity of this.argumentsToBeDeoptimized) {
			// We do not need a recursion tracker here as we already track whether
			// this field is deoptimized
			entity.deoptimizePath([...this.initPath, key]);
		}
		if (key === UnknownKey) {
			// save some memory
			this.deoptimizationInteractions = NO_INTERACTIONS;
			this.deoptimizations = EMPTY_PATH_TRACKER;
			this.deoptimizedFields = UNKNOWN_DEOPTIMIZED_FIELD;
			this.argumentsToBeDeoptimized = UNKNOWN_DEOPTIMIZED_ENTITY;
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

	includeArgumentPaths(entity: ExpressionEntity, context: InclusionContext) {
		this.includedPathTracker.includeAllPaths(entity, context, this.initPath);
	}
}
