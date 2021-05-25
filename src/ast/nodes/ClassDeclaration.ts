import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import ChildScope from '../scopes/ChildScope';
import { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import { GenericEsTreeNode } from './shared/Node';

export default class ClassDeclaration extends ClassNode {
	id!: IdentifierWithVariable | null;
	type!: NodeType.tClassDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		if (esTreeNode.id !== null) {
			this.id = new this.context.nodeConstructors.Identifier(
				esTreeNode.id,
				this,
				this.scope.parent as ChildScope
			) as IdentifierWithVariable;
		}
		super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (
			options.format === 'system' &&
			this.id &&
			options.exportNamesByVariable.has(this.id.variable)
		) {
			code.appendLeft(
				this.end,
				`${options.compact ? '' : ' '}${getSystemExportStatement([this.id.variable], options)};`
			);
		}
		super.render(code, options);
	}
}
