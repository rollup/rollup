import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { logConstVariableReassignError } from '../../utils/logs';
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
import type { NodeInteraction } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type Variable from '../variables/Variable';
import Identifier from './Identifier';
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
		| '**='
		| '&&='
		| '||='
		| '??=';
	declare right: ExpressionNode;
	declare type: NodeType.tAssignmentExpression;

	hasEffects(context: HasEffectsContext): boolean {
		const { deoptimized, left, operator, right } = this;
		if (!deoptimized) this.applyDeoptimizations();
		// MemberExpressions do not access the property before assignments if the
		// operator is '='.
		return (
			right.hasEffects(context) || left.hasEffectsAsAssignmentTarget(context, operator !== '=')
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return this.right.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		const { deoptimized, left, right, operator } = this;
		if (!deoptimized) this.applyDeoptimizations();
		this.included = true;
		if (
			includeChildrenRecursively ||
			operator !== '=' ||
			left.included ||
			left.hasEffectsAsAssignmentTarget(createHasEffectsContext(), false)
		) {
			left.includeAsAssignmentTarget(context, includeChildrenRecursively, operator !== '=');
		}
		right.includePath(path, context, includeChildrenRecursively);
	}

	initialise(): void {
		super.initialise();
		if (this.left instanceof Identifier) {
			const variable = this.scope.variables.get(this.left.name);
			if (variable?.kind === 'const') {
				this.scope.context.error(logConstVariableReassignError(), this.left.start);
			}
		}
		this.left.setAssignedValue(this.right);
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
		this.scope.context.requestTreeshakingPass();
	}
}
