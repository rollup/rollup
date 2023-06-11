import { locate } from 'locate-character';
import type MagicString from 'magic-string';
import { LOGLEVEL_INFO } from '../../utils/logging';
import { logFirstSideEffect } from '../../utils/logs';
import {
	findFirstLineBreakOutsideComment,
	type RenderOptions,
	renderStatementList
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase, type StatementNode } from './shared/Node';

export default class Program extends NodeBase {
	declare body: readonly StatementNode[];
	declare sourceType: 'module';
	declare type: NodeType.tProgram;

	private hasCachedEffect: boolean | null = null;
	private hasLoggedEffect = false;

	hasCachedEffects(): boolean {
		if (!this.included) {
			return false;
		}
		return this.hasCachedEffect === null
			? (this.hasCachedEffect = this.hasEffects(createHasEffectsContext()))
			: this.hasCachedEffect;
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const node of this.body) {
			if (node.hasEffects(context)) {
				if (this.context.options.experimentalLogSideEffects && !this.hasLoggedEffect) {
					this.hasLoggedEffect = true;
					const { code, log, module } = this.context;
					log(
						LOGLEVEL_INFO,
						logFirstSideEffect(code, module.id, locate(code, node.start, { offsetLine: 1 })),
						node.start
					);
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
			// Keep all consecutive lines that start with a comment
			while (code.original[start] === '/' && /[*/]/.test(code.original[start + 1])) {
				const firstLineBreak = findFirstLineBreakOutsideComment(
					code.original.slice(start, this.body[0].start)
				);
				if (firstLineBreak[0] === -1) {
					break;
				}
				start += firstLineBreak[1];
			}
			renderStatementList(this.body, code, start, this.end, options);
		} else {
			super.render(code, options);
		}
	}

	protected applyDeoptimizations() {}
}
