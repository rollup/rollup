import type MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type RenderOptions
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { type IncludeChildren, StatementBase, type StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	declare body: StatementNode;
	declare label: Identifier;
	declare type: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext): boolean {
		const brokenFlow = context.brokenFlow;
		context.ignore.labels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignore.labels.delete(this.label.name);
		if (context.includedLabels.has(this.label.name)) {
			context.includedLabels.delete(this.label.name);
			context.brokenFlow = brokenFlow;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const { brokenFlow, includedLabels } = context;
		context.includedLabels = new Set<string>();
		this.body.include(context, includeChildrenRecursively);
		// eslint-disable-next-line unicorn/consistent-destructuring
		if (includeChildrenRecursively || context.includedLabels.has(this.label.name)) {
			this.label.include();
			// eslint-disable-next-line unicorn/consistent-destructuring
			context.includedLabels.delete(this.label.name);
			context.brokenFlow = brokenFlow;
		}
		// eslint-disable-next-line unicorn/consistent-destructuring
		context.includedLabels = new Set([...includedLabels, ...context.includedLabels]);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.label.included) {
			this.label.render(code, options);
		} else {
			code.remove(
				this.start,
				findNonWhiteSpace(
					code.original,
					findFirstOccurrenceOutsideComment(code.original, ':', this.label.end) + 1
				)
			);
		}
		this.body.render(code, options);
	}
}
