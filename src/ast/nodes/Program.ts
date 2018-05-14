import MagicString from 'magic-string';
import { NodeBase, StatementNode } from './shared/Node';
import * as NodeType from './NodeType';
import { RenderOptions, renderStatementList, findFirstLineBreakOutsideComment } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import VariableDeclaration from './VariableDeclaration';
import ExpressionStatement from './ExpressionStatement';

export default class Program extends NodeBase {
	type: NodeType.tProgram;
	body: StatementNode[];
	sourceType: 'module';

	hasEffects(options: ExecutionPathOptions) {
		for (const node of this.body) {
			if (node.hasEffects(options)) return true;
		}
	}

	include() {
		this.included = true;
		for (const node of this.body) {
			if (node.shouldBeIncluded()) node.include();
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
