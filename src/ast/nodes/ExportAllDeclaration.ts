import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type Identifier from './Identifier';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type { ExportAllDeclarationParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase<ast.ExportAllDeclaration> {
	parent!: ExportAllDeclarationParent;
	attributes!: ImportAttribute[];
	exported!: Identifier | Literal<string> | null;
	needsBoundaries!: true;
	source!: Literal<string>;
	type!: NodeType.tExportAllDeclaration;

	hasEffects(): boolean {
		return false;
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addExport(this);
	}

	render(code: MagicString, _options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		code.remove(nodeRenderOptions!.start!, nodeRenderOptions!.end!);
	}

	protected applyDeoptimizations() {}
}

ExportAllDeclaration.prototype.needsBoundaries = true;
