import type MagicString from 'magic-string';
import relativeId from '../../utils/relativeId';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import { type IncludeChildren, logNode, NodeBase, type StatementNode } from './shared/Node';

export default class Program extends NodeBase {
	declare body: readonly StatementNode[];
	declare sourceType: 'module';
	declare type: NodeType.tProgram;

	private hasCachedEffect: boolean | null = null;
	private hasLoggedEffect = false;

	hasCachedEffects(): boolean {
		return this.hasCachedEffect === null
			? (this.hasCachedEffect = this.hasEffects(createHasEffectsContext()))
			: this.hasCachedEffect;
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const node of this.body) {
			if (node.hasEffects(context)) {
				if (!this.hasLoggedEffect) {
					this.hasLoggedEffect = true;
					let effect = logNode(node);
					let truncated = false;
					if (effect.length > 150) {
						truncated = true;
						effect = effect.slice(0, 150) + '...';
					}
					console.log(
						`==> First side effect in ${relativeId(this.context.module.id)}${
							truncated ? ' (truncated)' : ''
						}:`
					);
					console.log(effect);
					console.log('<==\n');
				}
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
