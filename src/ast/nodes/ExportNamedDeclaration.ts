import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type ClassDeclaration from './ClassDeclaration';
import type ExportSpecifier from './ExportSpecifier';
import type FunctionDeclaration from './FunctionDeclaration';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import { type Node, NodeBase } from './shared/Node';

export default class ExportNamedDeclaration extends NodeBase {
	declare declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	declare needsBoundaries: true;
	declare source: Literal<string> | null;
	declare specifiers: readonly ExportSpecifier[];
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
