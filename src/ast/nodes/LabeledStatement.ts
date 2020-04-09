import MagicString from 'magic-string';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext) {
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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		const brokenFlow = context.brokenFlow;
		this.body.include(context, includeChildrenRecursively);
		if (includeChildrenRecursively || context.includedLabels.has(this.label.name)) {
			this.label.include();
			context.includedLabels.delete(this.label.name);
			context.brokenFlow = brokenFlow;
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.label.included) {
			this.label.render(code, options);
		} else {
			code.remove(
				this.start,
				findFirstOccurrenceOutsideComment(code.original, ':', this.label.end) + 1
			);
		}
		this.body.render(code, options);
	}
}
