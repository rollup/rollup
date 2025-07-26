import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { LOGLEVEL_WARN } from '../../utils/logging';
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
	declare left: PatternNode;
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
	private isConstReassignment = false;

	hasEffects(context: HasEffectsContext): boolean {
		const { deoptimized, isConstReassignment, left, operator, right } = this;
		if (!deoptimized) this.applyDeoptimizations();
		// MemberExpressions do not access the property before assignments if the
		// operator is '='.
		return (
			isConstReassignment ||
			right.hasEffects(context) ||
			left.hasEffectsAsAssignmentTarget(context, operator !== '=') ||
			this.left.hasEffectsWhenDestructuring?.(context, EMPTY_PATH, right)
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return this.right.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		const { deoptimized, isConstReassignment, left, right, operator } = this;
		if (!deoptimized) this.applyDeoptimizations();
		if (!this.included) this.includeNode(context);
		const hasEffectsContext = createHasEffectsContext();
		if (
			includeChildrenRecursively ||
			isConstReassignment ||
			operator !== '=' ||
			left.included ||
			left.hasEffectsAsAssignmentTarget(hasEffectsContext, false) ||
			left.hasEffectsWhenDestructuring?.(hasEffectsContext, EMPTY_PATH, right)
		) {
			left.includeAsAssignmentTarget(context, includeChildrenRecursively, operator !== '=');
		}
		right.include(context, includeChildrenRecursively);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		this.right.includePath(UNKNOWN_PATH, context);
	}

	initialise(): void {
		super.initialise();
		if (this.left instanceof Identifier) {
			const variable = this.scope.variables.get(this.left.name);
			if (variable?.kind === 'const') {
				this.isConstReassignment = true;
				this.scope.context.log(LOGLEVEL_WARN, logConstVariableReassignError(), this.left.start);
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

	applyDeoptimizations() {
		this.deoptimized = true;
		this.left.deoptimizeAssignment(EMPTY_PATH, this.right);
		this.scope.context.requestTreeshakingPass();
	}
}
