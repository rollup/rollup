import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type * as nodes from './node-unions';
import type { YieldExpressionParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase<ast.YieldExpression> {
	parent!: YieldExpressionParent;
	argument!: nodes.Expression | null;
	delegate!: boolean;
	type!: NodeType.tYieldExpression;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return !(context.ignore.returnYield && !this.argument?.hasEffects(context));
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 5 /* 'yield'.length */) {
				code.prependLeft(this.start + 5, ' ');
			}
		}
	}
}
