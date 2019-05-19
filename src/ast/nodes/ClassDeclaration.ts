import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import ChildScope from '../scopes/ChildScope';
import { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import { GenericEsTreeNode } from './shared/Node';

export default class ClassDeclaration extends ClassNode {
	id: IdentifierWithVariable | null;
	type: NodeType.tClassDeclaration;

	initialise() {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		if (esTreeNode.id !== null) {
			this.id = new this.context.nodeConstructors.Identifier(esTreeNode.id, this, this.scope
				.parent as ChildScope) as IdentifierWithVariable;
		}
		super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions) {
		if (options.format === 'system' && this.id && this.id.variable.exportName) {
			code.appendLeft(
				this.end,
				` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`
			);
		}
		super.render(code, options);
	}
}
