import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	left!: PatternNode | ExpressionNode;
	operator!:
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
	right!: ExpressionNode;
	type!: NodeType.tAssignmentExpression;
	private deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		this.deoptimize();
		return (
			this.right.hasEffects(context) ||
			this.left.hasEffects(context) ||
			this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.deoptimize();
		return super.include(context, includeChildrenRecursively);
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

	shouldBeIncluded(context: InclusionContext): boolean {
		this.deoptimize();
		return super.shouldBeIncluded(context);
	}

	private deoptimize() {
		if (!this.deoptimized) {
			this.deoptimized = true;
			this.left.deoptimizePath(EMPTY_PATH);
			this.right.deoptimizePath(UNKNOWN_PATH);
		}
	}
}
