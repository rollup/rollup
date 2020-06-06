import MagicString from 'magic-string';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportExpressionLeft } from '../../utils/systemJsRendering';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	left!: PatternNode;
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
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			this.right.hasEffects(context) ||
			this.left.hasEffects(context) ||
			this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.left.include(context, includeChildrenRecursively);
		this.right.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		this.left.render(code, options);
		this.right.render(code, options);
		if (options.format === 'system') {
			const exportNames =
				this.left.variable && options.exportNamesByVariable.get(this.left.variable);
			const _ = options.compact ? '' : ' ';
			if (exportNames) {
				const operatorPos = findFirstOccurrenceOutsideComment(
					code.original,
					this.operator,
					this.left.end
				);
				const operation =
					this.operator.length > 1 ? `${exportNames[0]}${_}${this.operator.slice(0, -1)}` : '';
				const nextIsSpace =
					operation.length === 0 && code.original[operatorPos + this.operator.length] === ' ';
				const nextISNewline =
					code.original[operatorPos + this.operator.length + (nextIsSpace ? 1 : 0)] === '\n';
				code.overwrite(
					operatorPos,
					operatorPos + this.operator.length + (nextIsSpace ? 1 : 0),
					`=${_}${getSystemExportExpressionLeft(
						[this.left.variable!],
						!nextISNewline,
						options
					)}${operation}`
				);
				code.appendLeft(this.right.end, ')');
			} else {
				const systemPatternExports: Variable[] = [];
				this.left.addExportedVariables(systemPatternExports, options.exportNamesByVariable);
				if (systemPatternExports.length > 0) {
					const nextIsSpace = code.original[this.start] === ' ';
					const nextIsNewline = code.original[this.start + (nextIsSpace ? 1 : 0)] === '\n';
					code.prependRight(
						this.start + (nextIsSpace ? 1 : 0),
						getSystemExportExpressionLeft(systemPatternExports, !nextIsNewline, options)
					);
					code.appendLeft(this.end, ')');
				}
			}
		}
	}

	private applyDeoptimizations() {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
	}
}
