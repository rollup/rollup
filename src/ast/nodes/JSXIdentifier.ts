import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXClosingElement from './JSXClosingElement';
import type JSXMemberExpression from './JSXMemberExpression';
import type JSXOpeningElement from './JSXOpeningElement';
import type * as NodeType from './NodeType';
import IdentifierBase from './shared/IdentifierBase';

export default class JSXIdentifier extends IdentifierBase {
	type!: NodeType.tJSXIdentifier;
	name!: string;

	bind(): void {
		if (this.isReference()) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}

	render(
		code: MagicString,
		{ snippets: { getPropertyAccess }, useOriginalName }: RenderOptions
	): void {
		if (this.variable) {
			const name = this.variable.getName(getPropertyAccess, useOriginalName);

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					contentOnly: true,
					storeName: true
				});
			}
		}
	}

	private isReference(): boolean {
		switch (this.parent.type) {
			case 'JSXOpeningElement':
			case 'JSXClosingElement': {
				return (this.parent as JSXOpeningElement | JSXClosingElement).name === this;
			}
			case 'JSXMemberExpression': {
				return (this.parent as JSXMemberExpression).object === this;
			}
			case 'JSXAttribute':
			case 'JSXNamespacedName': {
				return false;
			}
			default: {
				throw new Error(`Unexpected parent node type for JSXIdentifier: ${this.parent.type}`);
			}
		}
	}
}
