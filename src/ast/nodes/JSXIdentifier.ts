import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXMemberExpression from './JSXMemberExpression';
import type * as NodeType from './NodeType';
import IdentifierBase from './shared/IdentifierBase';

const enum IdentifierType {
	Reference,
	NativeElementName,
	Other
}

export default class JSXIdentifier extends IdentifierBase {
	type!: NodeType.tJSXIdentifier;
	name!: string;

	private isNativeElement = false;

	bind(): void {
		const type = this.getType();
		if (type === IdentifierType.Reference) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		} else if (type === IdentifierType.NativeElementName) {
			this.isNativeElement = true;
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
		} else if (
			this.isNativeElement &&
			(this.scope.context.options.jsx as NormalizedJsxOptions).mode !== 'preserve'
		) {
			code.update(this.start, this.end, JSON.stringify(this.name));
		}
	}

	private getType(): IdentifierType {
		switch (this.parent.type) {
			case 'JSXOpeningElement':
			case 'JSXClosingElement': {
				return this.name.startsWith(this.name.charAt(0).toUpperCase())
					? IdentifierType.Reference
					: IdentifierType.NativeElementName;
			}
			case 'JSXMemberExpression': {
				return (this.parent as JSXMemberExpression).object === this
					? IdentifierType.Reference
					: IdentifierType.Other;
			}
			case 'JSXAttribute':
			case 'JSXNamespacedName': {
				return IdentifierType.Other;
			}
			default: {
				/* istanbul ignore next */
				throw new Error(`Unexpected parent node type for JSXIdentifier: ${this.parent.type}`);
			}
		}
	}
}
