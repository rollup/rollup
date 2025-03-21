import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import ClassDeclaration from './ClassDeclaration';
import type ExportSpecifier from './ExportSpecifier';
import type FunctionDeclaration from './FunctionDeclaration';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, type Node, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';
import type VariableDeclaration from './VariableDeclaration';

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
			let endBoundary = this.declaration.start;
			// the start of the decorator may be before the start of the class declaration
			if (this.declaration instanceof ClassDeclaration) {
				const decorators = this.declaration.decorators;
				for (const decorator of decorators) {
					endBoundary = Math.min(endBoundary, decorator.start);
				}
				if (endBoundary <= this.start) {
					endBoundary = this.declaration.start;
				}
			}
			code.remove(this.start, endBoundary);
			(this.declaration as Node).render(code, options, { end, start });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
ExportNamedDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportNamedDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
