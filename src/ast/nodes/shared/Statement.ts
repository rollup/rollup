import { Entity } from '../../Entity';
import { BasicNode, Node } from './Node';
import MagicString from 'magic-string';

export interface Statement extends Entity {}

export interface StatementNode extends Statement, Node {}

export class BasicStatementNode extends BasicNode implements StatementNode {
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
