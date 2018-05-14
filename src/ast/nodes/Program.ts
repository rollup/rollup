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

			let lastStatement: StatementNode;
			for (let i = this.body.length - 1; i >= 0; i--) {
				lastStatement = this.body[i];
				if (lastStatement.included) break;
			}
			if (lastStatement && code.original.charCodeAt(lastStatement.end - 1) !== 59 /*";"*/) {
				const trailingNewline =
					!options.compact ||
					findFirstLineBreakOutsideComment(code.original.slice(lastStatement.end)) !== -1;
				// these rules can be refined over time
				let needsSemicolon = false;
				if (trailingNewline) {
					if (
						lastStatement instanceof VariableDeclaration ||
						lastStatement instanceof ExpressionStatement
					)
						needsSemicolon = true;
				} else {
					needsSemicolon = true;
				}

				if (needsSemicolon) {
					let alreadyRenderedSemicolon = false;
					try {
						alreadyRenderedSemicolon = code
							.slice(lastStatement.end - 1, lastStatement.end)
							.endsWith(';');
					} catch (e) {}
					if (!alreadyRenderedSemicolon) code.appendLeft(lastStatement.end, ';');
				}
			}
		} else {
			super.render(code, options);
		}
	}
}
