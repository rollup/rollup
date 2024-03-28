import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type ClassDeclaration from './ClassDeclaration';
import type ExportSpecifier from './ExportSpecifier';
import type FunctionDeclaration from './FunctionDeclaration';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import type VariableDeclaration from './VariableDeclaration';
import { type Node, NodeBase } from './shared/Node';

export default class ExportNamedDeclaration extends NodeBase {
	declare attributes: ImportAttribute[];
	declare declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	declare needsBoundaries: true;
	declare source: Literal<string> | null;
	declare specifiers: readonly ExportSpecifier[];
	declare type: NodeType.tExportNamedDeclaration;

	bind(): void {
		// Do not bind specifiers
		this.declaration?.bind();
	}

	hasEffects(context: HasEffectsContext): boolean {
		return !!this.declaration?.hasEffects(context);
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addExport(this);
	}

	removeAnnotations(code: MagicString) {
		this.declaration?.removeAnnotations(code);
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

	protected applyDeoptimizations() {}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
