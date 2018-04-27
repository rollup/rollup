import { Node, NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal from './Literal';
import MagicString from 'magic-string';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import ClassDeclaration from './ClassDeclaration';
import VariableDeclaration from './VariableDeclaration';
import * as NodeType from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';

export default class ExportNamedDeclaration extends NodeBase {
	type: NodeType.tExportNamedDeclaration;
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	specifiers: ExportSpecifier[];
	source: Literal<string> | null;

	needsBoundaries: true;

	bind() {
		// Do not bind specifiers
		if (this.declaration !== null) this.declaration.bind();
	}

	hasEffects(options: ExecutionPathOptions) {
		return this.declaration && this.declaration.hasEffects(options);
	}

	initialise() {
		this.included = false;
		this.context.addExport(this);
	}

	render(code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		if (this.declaration === null) {
			code.remove(start, end);
		} else {
			code.remove(this.start, this.declaration.start);
			(<Node>this.declaration).render(code, options, { start, end });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
