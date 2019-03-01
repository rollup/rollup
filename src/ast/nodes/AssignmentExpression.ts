import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../values';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	left: PatternNode | ExpressionNode;
	operator:
		| '='
		| '+='
		| '-='
		| '*='
		| '/='
		| '%='
		| '<<='
		| '>>='
		| '>>>='
		| '|='
		| '^='
		| '&='
		| '**=';
	right: ExpressionNode;
	type: NodeType.tAssignmentExpression;

	bind() {
		super.bind();
		this.left.deoptimizePath(EMPTY_PATH);
		// We cannot propagate mutations of the new binding to the old binding with certainty
		this.right.deoptimizePath(UNKNOWN_PATH);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.right.hasEffects(options) ||
			this.left.hasEffects(options) ||
			this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, options);
	}

	render(code: MagicString, options: RenderOptions) {
		this.left.render(code, options);
		this.right.render(code, options);
		if (options.format === 'system') {
			if (this.left.variable && this.left.variable.exportName) {
				code.prependLeft(
					code.original.indexOf('=', this.left.end) + 1,
					` exports('${this.left.variable.exportName}',`
				);
				code.appendLeft(this.right.end, `)`);
			} else if ('addExportedVariables' in this.left) {
				const systemPatternExports: Variable[] = [];
				this.left.addExportedVariables(systemPatternExports);
				if (systemPatternExports.length > 0) {
					code.prependRight(
						this.start,
						`function (v) {${getSystemExportStatement(systemPatternExports)} return v;} (`
					);
					code.appendLeft(this.end, ')');
				}
			}
		}
	}
}
