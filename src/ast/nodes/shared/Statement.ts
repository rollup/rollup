import Node from '../../Node';
import MagicString from 'magic-string';

export default class Statement extends Node {
	render (code: MagicString, es: boolean) {
		if (!this.module.bundle.treeshake || this.included) {
			super.render(code, es);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
