import type MagicString from 'magic-string';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logCannotCallNamespace } from '../../utils/logs';
import { type RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { INTERACTION_CALLED } from '../NodeInteractions';
import type { EntityPathTracker } from '../utils/PathTracker';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import type Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import CallExpressionBase from './shared/CallExpressionBase';
import type { ExpressionEntity } from './shared/Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_RETURN_EXPRESSION } from './shared/Expression';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { onlyIncludeSelf } from './shared/Node';
import type TemplateLiteral from './TemplateLiteral';

export default class TaggedTemplateExpression extends CallExpressionBase {
	declare quasi: TemplateLiteral;
	declare tag: ExpressionNode;
	declare type: NodeType.tTaggedTemplateExpression;
	declare private args: ExpressionEntity[];

	bind(): void {
		super.bind();
		if (this.tag.type === NodeType.Identifier) {
			const name = (this.tag as Identifier).name;
			const variable = this.scope.findVariable(name);

			if (variable.isNamespace) {
				this.scope.context.log(LOGLEVEL_WARN, logCannotCallNamespace(name), this.start);
			}
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.quasi.expressions) {
			if (argument.hasEffects(context)) return true;
		}
		return (
			this.tag.hasEffects(context) ||
			this.tag.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context)
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		if (includeChildrenRecursively) {
			super.include(context, true);
		} else {
			this.quasi.include(context, false);
			this.tag.include(context, false);
			this.tag.includeCallArguments(this.interaction, context);
		}
	}

	initialise(): void {
		super.initialise();
		this.args = [UNKNOWN_EXPRESSION, ...this.quasi.expressions];
		this.interaction = {
			args: [
				this.tag instanceof MemberExpression && !this.tag.variable ? this.tag.object : null,
				...this.args
			],
			type: INTERACTION_CALLED,
			withNew: false
		};
	}

	render(code: MagicString, options: RenderOptions): void {
		this.tag.render(code, options, { isCalleeOfRenderedParent: true });
		this.quasi.render(code, options);
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		this.tag.deoptimizeArgumentsOnInteractionAtPath(
			this.interaction,
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER
		);
		this.scope.context.requestTreeshakingPass();
	}

	protected getReturnExpression(
		recursionTracker: EntityPathTracker = SHARED_RECURSION_TRACKER
	): [expression: ExpressionEntity, isPure: boolean] {
		if (this.returnExpression === null) {
			this.returnExpression = UNKNOWN_RETURN_EXPRESSION;
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

TaggedTemplateExpression.prototype.includeNode = onlyIncludeSelf;
