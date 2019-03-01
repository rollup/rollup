import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import ClassDeclaration from './ClassDeclaration';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { Node, NodeBase } from './shared/Node';
import VariableDeclaration from './VariableDeclaration';

export default class ExportNamedDeclaration extends NodeBase {
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	needsBoundaries: true;
	source: Literal<string> | null;
	specifiers: ExportSpecifier[];
	type: NodeType.tExportNamedDeclaration;

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
