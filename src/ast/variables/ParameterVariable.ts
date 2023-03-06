import type { AstContext } from '../../Module';
import type { NodeInteraction } from '../NodeInteractions';
import type ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import {
	deoptimizeInteraction,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION
} from '../nodes/shared/Expression';
import type { ObjectPath, ObjectPathKey } from '../utils/PathTracker';
import {
	DiscriminatedPathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface DeoptimizationInteraction {
	interaction: NodeInteraction;
	path: ObjectPath;
}

export default class ParameterVariable extends LocalVariable {
	private readonly deoptimizationInteractions: DeoptimizationInteraction[] = [];
	private readonly deoptimizations = new DiscriminatedPathTracker();
	private readonly deoptimizedFields = new Set<ObjectPathKey>();
	private readonly entitiesToBeDeoptimized = new Set<ExpressionEntity>();

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		context: AstContext
	) {
		super(name, declarator, UNKNOWN_EXPRESSION, context);
	}

	addEntityToBeDeoptimized(entity: ExpressionEntity): void {
		if (this.deoptimizedFields.has(UnknownKey)) {
			entity.deoptimizePath(UNKNOWN_PATH);
		} else {
			for (const field of this.deoptimizedFields) {
				entity.deoptimizePath([field]);
			}
		}
		for (const { interaction, path } of this.deoptimizationInteractions) {
			entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
		}
		this.entitiesToBeDeoptimized.add(entity);
	}

	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
		// For performance reasons, we fully deoptimize all deeper interactions
		if (path.length >= 2) {
			deoptimizeInteraction(interaction);
			return;
		}
		if (
			interaction.thisArg &&
			!this.deoptimizations.trackEntityAtPathAndGetIfTracked(
				path,
				interaction.args,
				interaction.thisArg
			)
		) {
			for (const entity of this.entitiesToBeDeoptimized) {
				entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
			}
			this.deoptimizationInteractions.push({
				interaction,
				path
			});
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0 || this.deoptimizedFields.has(UnknownKey)) {
			return;
		}
		const key = path[0];
		if (this.deoptimizedFields.has(key)) {
			return;
		}
		this.deoptimizedFields.add(key);
		for (const entity of this.entitiesToBeDeoptimized) {
			entity.deoptimizePath(path);
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
			this.deoptimizePath(path.slice(0, 1));
		}
		return UNKNOWN_RETURN_EXPRESSION;
	}
}
