import type MagicString from 'magic-string';
import { EMPTY_ARRAY } from '../../utils/blank';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { LiteralExpression } from './shared/Expression';
import { type ExpressionNode, type IncludeChildren, StatementBase } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	declare argument: ExpressionNode | null;
	declare type: NodeType.tReturnStatement;

	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];

	checkReached(origin: DeoptimizableEntity): boolean {
		if (this.deoptimized) return true;
		this.expressionsToBeDeoptimized.push(origin);
		return false;
	}

	applyDeoptimizations(): void {
		this.deoptimized = true;
		const { expressionsToBeDeoptimized } = this;
		if (expressionsToBeDeoptimized.length) {
			this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}

			this.scope.context.requestTreeshakingPass();
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!context.ignore.returnYield || this.argument?.hasEffects(context)) return true;
		context.brokenFlow = true;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.argument?.include(context, includeChildrenRecursively);
		context.brokenFlow = true;
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		this.argument?.includePath(UNKNOWN_PATH, context);
	}

	initialise(): void {
		super.initialise();
		this.scope.addReturnExpression(this.argument || new LiteralExpression(undefined, this));
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 6 /* 'return'.length */) {
				code.prependLeft(this.start + 6, ' ');
			}
		}
	}
}
