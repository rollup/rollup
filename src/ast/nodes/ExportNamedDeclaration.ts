import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Declaration from './Declaration';
import Literal from './Literal';
import MagicString from 'magic-string';
import ExportSpecifier from './ExportSpecifier';

export default class ExportNamedDeclaration extends Node {
	type: 'ExportNamedDeclaration';
	declaration: Declaration | null;
	specifiers: ExportSpecifier[];
	source: Literal | null;

	isExportDeclaration: true;

	bindChildren () {
		// Do not bind specifiers
		if (this.declaration) this.declaration.bind();
	}

	hasEffects (options: ExecutionPathOptions) {
		return this.declaration && this.declaration.hasEffects(options);
	}

	initialiseNode () {
		this.isExportDeclaration = true;
	}

	render (code: MagicString, es: boolean) {
		if (this.declaration) {
			code.remove(this.start, this.declaration.start);
			this.declaration.render(code, es);
		} else {
			const start = this.leadingCommentStart || this.start;
			const end = this.next || this.end;
			code.remove(start, end);
		}
	}
}
