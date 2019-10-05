import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { EffectsExecutionContext, ExecutionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { IncludeChildren, NodeBase, StatementNode } from './shared/Node';

export default class Program extends NodeBase {
	body!: StatementNode[];
	sourceType!: 'module';
	type!: NodeType.tProgram;

	hasEffects(context: EffectsExecutionContext) {
		for (const node of this.body) {
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context)) {
				node.include(includeChildrenRecursively, context);
			}
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			renderStatementList(this.body, code, this.start, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}
