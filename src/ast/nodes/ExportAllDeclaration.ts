import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type Identifier from './Identifier';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase<ast.ExportAllDeclaration> {
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
}

ExportAllDeclaration.prototype.needsBoundaries = true;
ExportAllDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportAllDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
