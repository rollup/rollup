import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type ClassDeclaration from './ClassDeclaration';
import type ExportSpecifier from './ExportSpecifier';
import type FunctionDeclaration from './FunctionDeclaration';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type { ExportNamedDeclarationParent } from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';
import type VariableDeclaration from './VariableDeclaration';

export default class ExportNamedDeclaration extends NodeBase<ast.ExportNamedDeclaration> {
	parent!: ExportNamedDeclarationParent;
	attributes!: ImportAttribute[];
	declaration!: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	needsBoundaries!: true;
	source!: Literal<string> | null;
	specifiers!: readonly ExportSpecifier[];
	type!: NodeType.tExportNamedDeclaration;

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
			this.declaration.render(code, options, { end, start });
		}
	}
}

ExportNamedDeclaration.prototype.needsBoundaries = true;
ExportNamedDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportNamedDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
