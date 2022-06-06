import MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { renderCallArguments } from '../../utils/renderCallArguments';
import { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { InclusionContext } from '../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	NodeInteraction,
	NodeInteractionCalled
} from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { type ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class NewExpression extends NodeBase {
	declare arguments: ExpressionNode[];
	declare callee: ExpressionNode;
	declare type: NodeType.tNewExpression;
	private declare interaction: NodeInteractionCalled;

	hasEffects(context: HasEffectsContext): boolean {
		try {
			for (const argument of this.arguments) {
				if (argument.hasEffects(context)) return true;
			}
			if (
				(this.context.options.treeshake as NormalizedTreeshakingOptions).annotations &&
				this.annotations
			)
				return false;
			return (
				this.callee.hasEffects(context) ||
				this.callee.hasEffectsOnInteractionAtPath(EMPTY_PATH, this.interaction, context)
			);
		} finally {
			if (!this.deoptimized) this.applyDeoptimizations();
		}
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return path.length > 0 || type !== INTERACTION_ACCESSED;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (includeChildrenRecursively) {
			super.include(context, includeChildrenRecursively);
		} else {
			this.included = true;
			this.callee.include(context, false);
		}
		this.callee.includeCallArguments(context, this.arguments);
	}

	initialise(): void {
		this.interaction = {
			args: this.arguments,
			thisArg: null,
			type: INTERACTION_CALLED,
			withNew: true
		};
	}

	render(code: MagicString, options: RenderOptions) {
		this.callee.render(code, options);
		renderCallArguments(code, options, this);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.deoptimizePath(UNKNOWN_PATH);
		}
		this.context.requestTreeshakingPass();
	}
}
