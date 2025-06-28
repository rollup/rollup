import type MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type RenderOptions
} from '../../utils/renderHelpers';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, type IncludeChildren, NodeBase, type StatementNode } from './shared/Node';

export default class LabeledStatement extends NodeBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext): boolean {
		const { brokenFlow, includedLabels } = context;
		context.ignore.labels.add(this.label.name);
		context.includedLabels = new Set<string>();
		let bodyHasEffects = false;
		if (this.body.hasEffects(context)) {
			bodyHasEffects = true;
		} else {
			context.ignore.labels.delete(this.label.name);
			if (context.includedLabels.has(this.label.name)) {
				context.includedLabels.delete(this.label.name);
				context.brokenFlow = brokenFlow;
			}
		}
		context.includedLabels = new Set([...includedLabels, ...context.includedLabels]);
		return bodyHasEffects;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		const { brokenFlow, includedLabels } = context;
		context.includedLabels = new Set<string>();
		this.body.include(context, includeChildrenRecursively);
		if (includeChildrenRecursively || context.includedLabels.has(this.label.name)) {
			this.label.include(context, includeChildrenRecursively);
			context.includedLabels.delete(this.label.name);
			context.brokenFlow = brokenFlow;
		}
		context.includedLabels = new Set([...includedLabels, ...context.includedLabels]);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		this.body.includePath(UNKNOWN_PATH, context);
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

LabeledStatement.prototype.applyDeoptimizations = doNotDeoptimize;
