import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	NodeRenderOptions,
	removeLineBreaks,
	RenderOptions
} from '../../utils/renderHelpers';
import { getSystemExportFunctionLeft } from '../../utils/systemJsRendering';
import { createHasEffectsContext, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	left!: ExpressionNode | PatternNode;
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
	protected deoptimized = false;

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
		let hasEffectsContext;
		if (
			includeChildrenRecursively ||
			this.operator !== '=' ||
			this.left.included ||
			((hasEffectsContext = createHasEffectsContext()),
			this.left.hasEffects(hasEffectsContext) ||
				this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, hasEffectsContext))
		) {
			this.left.include(context, includeChildrenRecursively);
		}
		this.right.include(context, includeChildrenRecursively);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ preventASI, renderedParentType }: NodeRenderOptions = BLANK
	) {
		if (this.left.included) {
			this.left.render(code, options);
			this.right.render(code, options);
		} else {
			const inclusionStart = findNonWhiteSpace(
				code.original,
				findFirstOccurrenceOutsideComment(code.original, '=', this.left.end) + 1
			);
			code.remove(this.start, inclusionStart);
			if (preventASI) {
				removeLineBreaks(code, inclusionStart, this.right.start);
			}
			this.right.render(code, options, {
				renderedParentType: renderedParentType || this.parent.type
			});
		}
		if (options.format === 'system') {
			const exportNames =
				this.left.variable && options.exportNamesByVariable.get(this.left.variable);
			if (this.left.type === 'Identifier' && exportNames) {
				const _ = options.compact ? '' : ' ';
				const operatorPos = findFirstOccurrenceOutsideComment(
					code.original,
					this.operator,
					this.left.end
				);
				const operation =
					this.operator.length > 1 ? `${exportNames[0]}${_}${this.operator.slice(0, -1)}${_}` : '';
				code.overwrite(
					operatorPos,
					findNonWhiteSpace(code.original, operatorPos + this.operator.length),
					`=${_}${
						exportNames.length === 1
							? `exports('${exportNames[0]}',${_}`
							: getSystemExportFunctionLeft([this.left.variable!], false, options)
					}${operation}`
				);
				code.appendLeft(this.right.end, ')');
			} else {
				const systemPatternExports: Variable[] = [];
				this.left.addExportedVariables(systemPatternExports, options.exportNamesByVariable);
				if (systemPatternExports.length > 0) {
					code.prependRight(
						this.start,
						`(${getSystemExportFunctionLeft(systemPatternExports, true, options)}`
					);
					code.appendLeft(this.end, '))');
				}
			}
		}
	}

	protected applyDeoptimizations() {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
	}
}
