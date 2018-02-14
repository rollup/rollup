import { NodeBase, Node } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal from './Literal';
import MagicString from 'magic-string';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import ClassDeclaration from './ClassDeclaration';
import VariableDeclaration from './VariableDeclaration';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';
import { BLANK } from '../../utils/object';

export default class ExportNamedDeclaration extends NodeBase {
	type: NodeType.ExportNamedDeclaration;
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	specifiers: ExportSpecifier[];
	source: Literal<string> | null;

	needsBoundaries: true;
	isExportDeclaration: true;

	bindChildren () {
		// Do not bind specifiers
		if (this.declaration) this.declaration.bind();
	}

	hasEffects (options: ExecutionPathOptions) {
		return this.declaration && this.declaration.hasEffects(options);
	}

	render (code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		if (this.declaration === null) {
			code.remove(start, end);
		} else {
			code.remove(this.start, this.declaration.start);
			(<Node>this.declaration).render(code, options, { start, end });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
ExportNamedDeclaration.prototype.isExportDeclaration = true;
