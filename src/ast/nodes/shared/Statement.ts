import { GenericNode, Node } from './Node';
import MagicString from 'magic-string';

export interface StatementNode extends Node {}

export class GenericStatementNode extends GenericNode implements StatementNode {
	render (code: MagicString, es: boolean) {
		if (!this.module.graph.treeshake || this.included) {
			super.render(code, es);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
