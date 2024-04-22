import type { AstContext } from '../../Module';
import { EMPTY_ARRAY } from '../../utils/blank';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ASSIGNED, INTERACTION_CALLED } from '../NodeInteractions';
import type ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity, LiteralValueOrUnknown } from '../nodes/shared/Expression';
import {
	deoptimizeInteraction,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from '../nodes/shared/Expression';
import type { ObjectPath, ObjectPathKey } from '../utils/PathTracker';
import {
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
	private knownExpressionsToBeDeoptimized: DeoptimizableEntity[] = [];

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
		for (const expression of this.knownExpressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
		this.knownExpressionsToBeDeoptimized = [];
	}

	private knownValue: ExpressionEntity = UNKNOWN_EXPRESSION;
	/**
	 * If we are sure about the value of this parameter, we can set it here.
	 * It can be a literal or the only possible value of the parameter.
	 * an undefined value means that the parameter is not known.
	 * @param value The known value of the parameter to be set.
	 */
	setKnownValue(value: ExpressionEntity): void {
		if (this.isReassigned) {
			return;
		}
		if (this.knownValue !== value) {
			for (const expression of this.knownExpressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
			this.knownExpressionsToBeDeoptimized = [];
		}
		this.knownValue = value;
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.isReassigned) {
			return UnknownValue;
		}
		this.knownExpressionsToBeDeoptimized.push(origin);
		return recursionTracker.withTrackedEntityAtPath(
			path,
			this.knownValue,
			() => this.knownValue!.getLiteralValueAtPath(path, recursionTracker, origin),
			UnknownValue
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		// assigned is a bit different, since the value has a new name (the parameter)
		return interaction.type === INTERACTION_ASSIGNED
			? super.hasEffectsOnInteractionAtPath(path, interaction, context)
			: this.knownValue.hasEffectsOnInteractionAtPath(path, interaction, context);
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
