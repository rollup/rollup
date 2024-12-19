import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import type { ExpressionEntity } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';
import type { DeclarationPatternNode, PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class AssignmentPattern extends NodeBase implements DeclarationPatternNode {
	declare left: PatternNode;
	declare right: ExpressionNode;
	declare type: NodeType.tAssignmentPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		this.left.addExportedVariables(variables, exportNamesByVariable);
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		return (this.left as DeclarationPatternNode).declare(kind, destructuredInitPath, init);
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void {
		this.left.deoptimizeAssignment(destructuredInitPath, init);
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			this.left.deoptimizePath(path);
		}
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

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return this.left.hasEffectsWhenDestructuring(context, destructuredInitPath, init);
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		let included =
			this.left.includeDestructuredIfNecessary(context, destructuredInitPath, init) ||
			this.included;
		if ((included ||= this.right.shouldBeIncluded(context))) {
			this.right.include(context, false);
			if (!this.left.included) {
				this.left.included = true;
				// Unfortunately, we need to include the left side again now, so that
				// any declared variables are properly included.
				this.left.includeDestructuredIfNecessary(context, destructuredInitPath, init);
			}
		}
		return (this.included = included);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		this.right.includePath(UNKNOWN_PATH, context);
	}

	markDeclarationReached(): void {
		(this.left as DeclarationPatternNode).markDeclarationReached();
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ isShorthandProperty }: NodeRenderOptions = BLANK
	): void {
		this.left.render(code, options, { isShorthandProperty });
		this.right.render(code, options);
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
		this.scope.context.requestTreeshakingPass();
	}
}
