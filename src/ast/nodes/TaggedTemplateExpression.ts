import type MagicString from 'magic-string';
import { type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { InclusionContext } from '../ExecutionContext';
import { EVENT_CALLED } from '../NodeEvents';
import {
	EMPTY_PATH,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import type TemplateLiteral from './TemplateLiteral';
import CallExpressionBase from './shared/CallExpressionBase';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import { type ExpressionNode, IncludeChildren } from './shared/Node';

export default class TaggedTemplateExpression extends CallExpressionBase {
	declare quasi: TemplateLiteral;
	declare tag: ExpressionNode;
	declare type: NodeType.tTaggedTemplateExpression;

	bind(): void {
		super.bind();
		if (this.tag.type === NodeType.Identifier) {
			const name = (this.tag as Identifier).name;
			const variable = this.scope.findVariable(name);

			if (variable.isNamespace) {
				this.context.warn(
					{
						code: 'CANNOT_CALL_NAMESPACE',
						message: `Cannot call a namespace ('${name}')`
					},
					this.start
				);
			}
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		try {
			for (const argument of this.quasi.expressions) {
				if (argument.hasEffects(context)) return true;
			}
			return (
				this.tag.hasEffects(context) ||
				this.tag.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.callOptions, context)
			);
		} finally {
			if (!this.deoptimized) this.applyDeoptimizations();
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.tag.include(context, includeChildrenRecursively);
		this.quasi.include(context, includeChildrenRecursively);
		this.tag.includeArgumentsWhenCalledAtPath(EMPTY_PATH, context, this.callOptions.args);
		const returnExpression = this.getReturnExpression();
		if (!returnExpression.included) {
			returnExpression.include(context, false);
		}
	}

	initialise(): void {
		this.callOptions = {
			args: [UNKNOWN_EXPRESSION, ...this.quasi.expressions],
			thisParam:
				this.tag instanceof MemberExpression && !this.tag.variable ? this.tag.object : null,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions): void {
		this.tag.render(code, options, { isCalleeOfRenderedParent: true });
		this.quasi.render(code, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		const { thisParam } = this.callOptions;
		if (thisParam) {
			this.tag.deoptimizeThisOnEventAtPath(
				EVENT_CALLED,
				EMPTY_PATH,
				thisParam,
				SHARED_RECURSION_TRACKER
			);
		}
		for (const argument of this.quasi.expressions) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
		this.context.requestTreeshakingPass();
	}

	protected getReturnExpression(
		recursionTracker: PathTracker = SHARED_RECURSION_TRACKER
	): ExpressionEntity {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_EXPRESSION;
			return (this.returnExpression = this.tag.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				this.callOptions,
				recursionTracker,
				this
			));
		}
		return this.returnExpression;
	}
}
