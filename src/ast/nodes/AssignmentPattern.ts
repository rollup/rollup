import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../values';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	left: PatternNode;
	right: ExpressionNode;
	type: NodeType.tAssignmentPattern;

	addExportedVariables(variables: Variable[]): void {
		this.left.addExportedVariables(variables);
	}

	bind() {
		super.bind();
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
	}

	declare(kind: string, init: ExpressionEntity) {
		this.left.declare(kind, init);
	}

	deoptimizePath(path: ObjectPath) {
		path.length === 0 && this.left.deoptimizePath(path);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ isShorthandProperty }: NodeRenderOptions = BLANK
	) {
		this.left.render(code, options, { isShorthandProperty });
		this.right.render(code, options);
	}
}
