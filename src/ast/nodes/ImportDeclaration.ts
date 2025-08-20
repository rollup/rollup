import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type ImportAttribute from './ImportAttribute';
import type ImportDefaultSpecifier from './ImportDefaultSpecifier';
import type ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import type ImportSpecifier from './ImportSpecifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportDeclaration extends NodeBase {
	declare attributes: ImportAttribute[];
	declare needsBoundaries: true;
	declare phase: 'source' | 'defer' | 'instance';
	declare source: Literal<string>;
	declare specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	declare type: NodeType.tImportDeclaration;

	// Do not bind specifiers or attributes
	bind(): void {}

	hasEffects(): boolean {
		return false;
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addImport(this);
	}

	render(code: MagicString, _options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		code.remove(nodeRenderOptions!.start!, nodeRenderOptions!.end!);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;
ImportDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
