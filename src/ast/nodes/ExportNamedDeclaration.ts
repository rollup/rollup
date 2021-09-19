import MagicString from 'magic-string';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext } from '../ExecutionContext';
import ClassDeclaration from './ClassDeclaration';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import Literal from './Literal';
import * as NodeType from './NodeType';
import VariableDeclaration from './VariableDeclaration';
import { Node, NodeBase } from './shared/Node';

export default class ExportNamedDeclaration extends NodeBase {
	declare declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	declare needsBoundaries: true;
	declare source: Literal<string> | null;
	declare specifiers: ExportSpecifier[];
	declare type: NodeType.tExportNamedDeclaration;

	bind(): void {
		// Do not bind specifiers
		if (this.declaration !== null) this.declaration.bind();
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.declaration !== null && this.declaration.hasEffects(context);
	}

	initialise(): void {
		this.context.addExport(this);
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		const { start, end } = nodeRenderOptions as { end: number; start: number };
		if (this.declaration === null) {
			code.remove(start, end);
		} else {
			code.remove(this.start, this.declaration.start);
			(this.declaration as Node).render(code, options, { end, start });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
