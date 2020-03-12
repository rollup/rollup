import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { IncludeChildren, NodeBase, StatementNode } from './shared/Node';

export default class Program extends NodeBase {
	body!: StatementNode[];
	sourceType!: 'module';
	type!: NodeType.tProgram;

	private hasCachedEffect = false;

	hasEffects(context: HasEffectsContext) {
		// We are caching here to later more efficiently identify side-effect-free modules
		if (this.hasCachedEffect) return true;
		for (const node of this.body) {
			if (node.hasEffects(context)) {
				return (this.hasCachedEffect = true);
			}
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context)) {
				node.include(context, includeChildrenRecursively);
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
