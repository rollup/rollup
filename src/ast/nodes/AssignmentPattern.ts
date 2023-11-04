import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import type { ExpressionEntity } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	declare left: PatternNode;
	declare right: ExpressionNode;
	declare type: NodeType.tAssignmentPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		this.left.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[] {
		return this.left.declare(kind, init);
	}

	deoptimizePath(path: ObjectPath): void {
		path.length === 0 && this.left.deoptimizePath(path);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		return (
			path.length > 0 || this.left.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)
		);
	}

	markDeclarationReached(): void {
		this.left.markDeclarationReached();
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ isShorthandProperty }: NodeRenderOptions = BLANK
	): void {
		this.left.render(code, options, { isShorthandProperty });
		this.right.render(code, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
		this.scope.context.requestTreeshakingPass();
	}
}
