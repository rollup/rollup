import { NodeBase } from './shared/Node';
import Literal from './Literal';
import MagicString from 'magic-string';

export default class ExportAllDeclaration extends NodeBase {
	type: 'ExportAllDeclaration';
	source: Literal<string>;
	isExportDeclaration: true;

	initialiseNode () {
		this.isExportDeclaration = true;
	}

	render (code: MagicString, _es: boolean) {
		code.remove(this.leadingCommentStart || this.start, this.next || this.end);
	}
}
