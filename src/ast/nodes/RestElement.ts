import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class RestElement extends NodeBase implements PatternNode {
	declare argument: PatternNode;
	declare type: NodeType.tRestElement;
	private declarationInit: ExpressionEntity | null = null;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		this.argument.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[] {
		this.declarationInit = init;
		return this.argument.declare(kind, UNKNOWN_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			this.argument.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		return (
			path.length > 0 ||
			this.argument.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)
		);
	}

	markDeclarationReached(): void {
		this.argument.markDeclarationReached();
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
			this.scope.context.requestTreeshakingPass();
		}
	}
}
