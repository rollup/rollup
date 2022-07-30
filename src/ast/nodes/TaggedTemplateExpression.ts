import type MagicString from 'magic-string';
import { errCannotCallNamespace } from '../../utils/error';
import { type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { InclusionContext } from '../ExecutionContext';
import { INTERACTION_CALLED, NodeInteractionWithThisArg } from '../NodeInteractions';
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
				this.context.warn(errCannotCallNamespace(name), this.start);
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
				this.tag.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context)
			);
		} finally {
			if (!this.deoptimized) this.applyDeoptimizations();
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (includeChildrenRecursively) {
			super.include(context, includeChildrenRecursively);
		} else {
			this.included = true;
			this.tag.include(context, includeChildrenRecursively);
			this.quasi.include(context, includeChildrenRecursively);
		}
		this.tag.includeCallArguments(context, this.interaction.args);
		const returnExpression = this.getReturnExpression();
		if (!returnExpression.included) {
			returnExpression.include(context, false);
		}
	}

	initialise(): void {
		this.interaction = {
			args: [UNKNOWN_EXPRESSION, ...this.quasi.expressions],
			thisArg: this.tag instanceof MemberExpression && !this.tag.variable ? this.tag.object : null,
			type: INTERACTION_CALLED,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions): void {
		this.tag.render(code, options, { isCalleeOfRenderedParent: true });
		this.quasi.render(code, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.interaction.thisArg) {
			this.tag.deoptimizeThisOnInteractionAtPath(
				this.interaction as NodeInteractionWithThisArg,
				EMPTY_PATH,
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
				this.interaction,
				recursionTracker,
				this
			));
		}
		return this.returnExpression;
	}
}
