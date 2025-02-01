import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type Identifier from './Identifier';
import type ImportAttribute from './ImportAttribute';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase {
	declare attributes: ImportAttribute[];
	declare exported: Identifier | Literal<string> | null;
	declare needsBoundaries: true;
	declare source: Literal<string>;
	declare type: NodeType.tExportAllDeclaration;

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
