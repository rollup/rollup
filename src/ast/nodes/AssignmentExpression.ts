import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	NodeRenderOptions,
	removeLineBreaks,
	RenderOptions
} from '../../utils/renderHelpers';
import {
	renderSystemExportExpression,
	renderSystemExportFunction,
	renderSystemExportSequenceAfterExpression
} from '../../utils/systemJsRendering';
import { createHasEffectsContext, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import ObjectPattern from './ObjectPattern';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

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
		{ preventASI, renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
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
				renderedParentType: renderedParentType || this.parent.type,
				renderedSurroundingElement: renderedSurroundingElement || this.parent.type
			});
		}
		if (options.format === 'system') {
			if (this.left instanceof Identifier) {
				const variable = this.left.variable!;
				const exportNames = options.exportNamesByVariable.get(variable);
				if (exportNames) {
					if (exportNames.length === 1) {
						renderSystemExportExpression(variable, this.start, this.end, code, options);
					} else {
						renderSystemExportSequenceAfterExpression(
							variable,
							this.start,
							this.end,
							this.parent.type !== NodeType.ExpressionStatement,
							code,
							options
						);
					}
					return;
				}
			} else {
				const systemPatternExports: Variable[] = [];
				this.left.addExportedVariables(systemPatternExports, options.exportNamesByVariable);
				if (systemPatternExports.length > 0) {
					renderSystemExportFunction(
						systemPatternExports,
						this.start,
						this.end,
						renderedSurroundingElement === NodeType.ExpressionStatement,
						code,
						options
					);
					return;
				}
			}
		}
		if (
			this.left.included &&
			this.left instanceof ObjectPattern &&
			(renderedSurroundingElement === NodeType.ExpressionStatement ||
				renderedSurroundingElement === NodeType.ArrowFunctionExpression)
		) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
		this.context.requestTreeshakingPass();
	}
}
