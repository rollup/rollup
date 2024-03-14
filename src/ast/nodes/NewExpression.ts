import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { renderCallArguments } from '../../utils/renderCallArguments';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import { INTERACTION_ACCESSED, INTERACTION_CALLED } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class NewExpression extends NodeBase {
	declare arguments: ExpressionNode[];
	declare callee: ExpressionNode;
	declare type: NodeType.tNewExpression;
	private declare interaction: NodeInteractionCalled;
	/** Marked with #__PURE__ annotation */
	declare annotationPure?: boolean;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const argument of this.arguments) {
			if (argument.hasEffects(context)) return true;
		}
		if (this.annotationPure) {
			return false;
		}
		return (
			this.callee.hasEffects(context) ||
			this.callee.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context)
		);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return path.length > 0 || type !== INTERACTION_ACCESSED;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (includeChildrenRecursively) {
			super.includePath(path, context, includeChildrenRecursively);
		} else {
			this.included = true;
			this.callee.includePath(path, context, false);
		}
		this.callee.includeCallArguments(context, this.arguments);
	}

	initialise(): void {
		super.initialise();
		this.interaction = {
			args: [null, ...this.arguments],
			type: INTERACTION_CALLED,
			withNew: true
		};
		if (
			this.annotations &&
			(this.scope.context.options.treeshake as NormalizedTreeshakingOptions).annotations
		) {
			this.annotationPure = this.annotations.some(comment => comment.type === 'pure');
		}
	}

	render(code: MagicString, options: RenderOptions) {
		this.callee.render(code, options);
		renderCallArguments(code, options, this);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.callee.deoptimizeArgumentsOnInteractionAtPath(
			this.interaction,
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER
		);
		this.scope.context.requestTreeshakingPass();
	}
}
