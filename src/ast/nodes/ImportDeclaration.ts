import type MagicString from 'magic-string';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type ImportDefaultSpecifier from './ImportDefaultSpecifier';
import type ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import type ImportSpecifier from './ImportSpecifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportDeclaration extends NodeBase {
	declare needsBoundaries: true;
	declare source: Literal<string>;
	declare specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	declare type: NodeType.tImportDeclaration;

	// Do not bind specifiers
	bind(): void {}

	hasEffects(): boolean {
		return false;
	}

	initialise(): void {
		this.context.addImport(this);
	}

	render(code: MagicString, _options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		code.remove(nodeRenderOptions!.start!, nodeRenderOptions!.end!);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;
