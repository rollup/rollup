import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	left!: PatternNode;
	right!: ExpressionNode;
	type!: NodeType.tAssignmentPattern;
	private deoptimized = false;

	addExportedVariables(variables: Variable[]): void {
		this.left.addExportedVariables(variables);
	}

	declare(kind: string, init: ExpressionEntity) {
		return this.left.declare(kind, init);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return this.right.hasEffects(context) || this.left.hasEffects(context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: boolean | 'variables') {
		if (!this.deoptimized) this.applyDeoptimizations();
		super.include(context, includeChildrenRecursively);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ isShorthandProperty }: NodeRenderOptions = BLANK
	) {
		this.left.render(code, options, { isShorthandProperty });
		this.right.render(code, options);
	}

	private applyDeoptimizations() {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
	}
}
