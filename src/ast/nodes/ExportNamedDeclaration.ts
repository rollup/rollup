import MagicString from 'magic-string';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext } from '../ExecutionContext';
import ClassDeclaration from './ClassDeclaration';
import ExportNamespaceSpecifier from './ExportNamespaceSpecifier';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { Node, NodeBase } from './shared/Node';
import VariableDeclaration from './VariableDeclaration';

export default class ExportNamedDeclaration extends NodeBase {
	declaration!: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	needsBoundaries!: true;
	source!: Literal<string> | null;
	specifiers!: (ExportSpecifier | ExportNamespaceSpecifier)[];
	type!: NodeType.tExportNamedDeclaration;

	bind() {
		// Do not bind specifiers
		if (this.declaration !== null) this.declaration.bind();
	}

	hasEffects(context: HasEffectsContext) {
		return this.declaration !== null && this.declaration.hasEffects(context);
	}

	initialise() {
		this.context.addExport(this);
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions) {
		const { start, end } = nodeRenderOptions as { end: number; start: number };
		if (this.declaration === null) {
			code.remove(start, end);
		} else {
			code.remove(this.start, this.declaration.start);
			(this.declaration as Node).render(code, options, { start, end });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
