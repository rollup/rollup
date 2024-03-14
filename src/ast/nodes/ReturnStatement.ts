import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { type ExpressionNode, type IncludeChildren, StatementBase } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	declare argument: ExpressionNode | null;
	declare type: NodeType.tReturnStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (!context.ignore.returnYield || this.argument?.hasEffects(context)) return true;
		context.brokenFlow = true;
		return false;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		this.argument?.includePath(path, context, includeChildrenRecursively);
		context.brokenFlow = true;
	}

	initialise(): void {
		super.initialise();
		this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
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
