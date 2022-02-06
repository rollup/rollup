import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import type ChildScope from '../scopes/ChildScope';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import type * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import type { GenericEsTreeNode } from './shared/Node';

export default class ClassDeclaration extends ClassNode {
	declare id: IdentifierWithVariable | null;
	declare type: NodeType.tClassDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(
				esTreeNode.id,
				this,
				this.scope.parent as ChildScope
			) as IdentifierWithVariable;
		}
		super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			exportNamesByVariable,
			format,
			snippets: { _ }
		} = options;
		if (format === 'system' && this.id && exportNamesByVariable.has(this.id.variable)) {
			code.appendLeft(this.end, `${_}${getSystemExportStatement([this.id.variable], options)};`);
		}
		super.render(code, options);
	}
}
