import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type NodeRenderOptions,
	removeLineBreaks,
	type RenderOptions
} from '../../utils/renderHelpers';
import {
	renderSystemExportExpression,
	renderSystemExportFunction,
	renderSystemExportSequenceAfterExpression
} from '../../utils/systemJsRendering';
import {
	createHasEffectsContext,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import { INTERACTION_ACCESSED, INTERACTION_ASSIGNED, NodeInteraction } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type Variable from '../variables/Variable';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import ObjectPattern from './ObjectPattern';
import { type ExpressionNode, type IncludeChildren, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	declare left: ExpressionNode | PatternNode;
	declare operator:
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
	declare right: ExpressionNode;
	declare type: NodeType.tAssignmentExpression;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const { right, left } = this;
		// MemberExpressions do not access the property before assignments if the
		// operator is '='. Moreover, they imply a "this" value for setters.
		return (
			right.hasEffects(context) ||
			(left instanceof MemberExpression
				? left.hasEffectsAsAssignmentTarget(context, this.operator !== '=', right)
				: left.hasEffects(context) ||
				  left.hasEffectsOnInteractionAtPath(
						EMPTY_PATH,
						{ type: INTERACTION_ASSIGNED, value: right },
						context
				  ))
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (path.length === 0) {
			if (interaction.type === INTERACTION_ACCESSED) {
				return false;
			}
			if (interaction.type === INTERACTION_ASSIGNED) {
				return true;
			}
		}
		return this.right.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		let hasEffectsContext;
		const { left, right, operator } = this;
		const isMemberExpression = left instanceof MemberExpression;
		if (
			includeChildrenRecursively ||
			operator !== '=' ||
			left.included ||
			((hasEffectsContext = createHasEffectsContext()),
			isMemberExpression
				? left.hasEffectsAsAssignmentTarget(hasEffectsContext, false, right)
				: left.hasEffects(hasEffectsContext) ||
				  left.hasEffectsOnInteractionAtPath(
						EMPTY_PATH,
						{ type: INTERACTION_ASSIGNED, value: right },
						hasEffectsContext
				  ))
		) {
			if (isMemberExpression) {
				left.includeAsAssignmentTarget(
					context,
					includeChildrenRecursively,
					operator !== '=',
					right
				);
			} else {
				left.include(context, includeChildrenRecursively);
			}
		}
		right.include(context, includeChildrenRecursively);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ preventASI, renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		const { left, right, start, end, parent } = this;
		if (left.included) {
			left.render(code, options);
			right.render(code, options);
		} else {
			const inclusionStart = findNonWhiteSpace(
				code.original,
				findFirstOccurrenceOutsideComment(code.original, '=', left.end) + 1
			);
			code.remove(start, inclusionStart);
			if (preventASI) {
				removeLineBreaks(code, inclusionStart, right.start);
			}
			right.render(code, options, {
				renderedParentType: renderedParentType || parent.type,
				renderedSurroundingElement: renderedSurroundingElement || parent.type
			});
		}
		if (options.format === 'system') {
			if (left instanceof Identifier) {
				const variable = left.variable!;
				const exportNames = options.exportNamesByVariable.get(variable);
				if (exportNames) {
					if (exportNames.length === 1) {
						renderSystemExportExpression(variable, start, end, code, options);
					} else {
						renderSystemExportSequenceAfterExpression(
							variable,
							start,
							end,
							parent.type !== NodeType.ExpressionStatement,
							code,
							options
						);
					}
					return;
				}
			} else {
				const systemPatternExports: Variable[] = [];
				left.addExportedVariables(systemPatternExports, options.exportNamesByVariable);
				if (systemPatternExports.length > 0) {
					renderSystemExportFunction(
						systemPatternExports,
						start,
						end,
						renderedSurroundingElement === NodeType.ExpressionStatement,
						code,
						options
					);
					return;
				}
			}
		}
		if (
			left.included &&
			left instanceof ObjectPattern &&
			(renderedSurroundingElement === NodeType.ExpressionStatement ||
				renderedSurroundingElement === NodeType.ArrowFunctionExpression)
		) {
			code.appendRight(start, '(');
			code.prependLeft(end, ')');
		}
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
		this.context.requestTreeshakingPass();
	}
}
