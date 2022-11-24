import type MagicString from 'magic-string';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { createHasEffectsContext } from '../ExecutionContext';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase, type StatementNode } from './shared/Node';

export default class Program extends NodeBase {
	declare body: readonly StatementNode[];
	declare sourceType: 'module';
	declare type: NodeType.tProgram;

	private hasCachedEffect: boolean | null = null;

	hasCachedEffects(): boolean {
		return this.hasCachedEffect === null
			? (this.hasCachedEffect = this.hasEffects(createHasEffectsContext()))
			: this.hasCachedEffect;
	}

	hasEffects(context: HasEffectsContext): boolean {
		// We are caching here to later more efficiently identify side-effect-free modules
		if (this.hasCachedEffect) return true;
		for (const node of this.body) {
			if (node.hasEffects(context)) {
				return (this.hasCachedEffect = true);
			}
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context)) {
				node.include(context, includeChildrenRecursively);
			}
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		let start = this.start;
		if (code.original.startsWith('#!')) {
			start = Math.min(code.original.indexOf('\n') + 1, this.end);
			code.remove(0, start);
		}
		if (this.body.length > 0) {
			renderStatementList(this.body, code, start, this.end, options);
		} else {
			super.render(code, options);
		}
	}

	protected applyDeoptimizations() {}
}
