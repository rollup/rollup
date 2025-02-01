import type MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	type NodeRenderOptions,
	type RenderOptions,
	renderStatementList
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize,
	type StatementNode
} from './shared/Node';

export default class SwitchCase extends NodeBase {
	declare consequent: readonly StatementNode[];
	declare needsBoundaries: true;
	declare test: ExpressionNode | null;
	declare type: NodeType.tSwitchCase;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test?.hasEffects(context)) return true;
		for (const node of this.consequent) {
			if (context.brokenFlow) break;
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.test?.include(context, includeChildrenRecursively);
		for (const node of this.consequent) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(context, includeChildrenRecursively);
		}
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		if (this.test) {
			this.test.render(code, options);
			if (this.test.start === this.start + 4) {
				code.prependLeft(this.test.start, ' ');
			}
		}
		if (this.consequent.length > 0) {
			const testEnd = this.test
				? this.test.end
				: findFirstOccurrenceOutsideComment(code.original, 'default', this.start) + 7;
			const consequentStart = findFirstOccurrenceOutsideComment(code.original, ':', testEnd) + 1;
			renderStatementList(this.consequent, code, consequentStart, nodeRenderOptions!.end!, options);
		}
	}
}

SwitchCase.prototype.needsBoundaries = true;
SwitchCase.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
SwitchCase.prototype.applyDeoptimizations = doNotDeoptimize;
