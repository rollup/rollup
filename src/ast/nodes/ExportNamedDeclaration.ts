import { BasicNode } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal from './Literal';
import MagicString from 'magic-string';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import ClassDeclaration from './ClassDeclaration';
import VariableDeclaration from './VariableDeclaration';

export default class ExportNamedDeclaration extends BasicNode {
	type: 'ExportNamedDeclaration';
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	specifiers: ExportSpecifier[];
	source: Literal<string> | null;

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
