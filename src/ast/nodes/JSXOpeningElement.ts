import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXAttribute from './JSXAttribute';
import type JSXIdentifier from './JSXIdentifier';
import type JSXMemberExpression from './JSXMemberExpression';
import type JSXNamespacedName from './JSXNamespacedName';
import type * as NodeType from './NodeType';
import JSXOpeningBase from './shared/JSXOpeningBase';

export default class JSXOpeningElement extends JSXOpeningBase {
	type!: NodeType.tJSXOpeningElement;
	name!: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
	attributes!: JSXAttribute /* TODO | JSXSpreadAttribute */[];
	selfClosing!: boolean;

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const { factory, preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const {
				snippets: { getPropertyAccess },
				useOriginalName
			} = options;
			const [, ...nestedName] = factory.split('.');
			code.overwrite(
				this.start,
				this.name.start,
				`/*#__PURE__*/${[this.factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.')}(`,
				{ contentOnly: true }
			);
			if (this.attributes.length > 0) {
				code.overwrite(this.name.end, this.attributes[0].start, ', { ', { contentOnly: true });
				for (let index = 0; index < this.attributes.length - 1; index++) {
					code.appendLeft(this.attributes[index].end, ', ');
				}
				code.overwrite(this.attributes.at(-1)!.end, this.end, ' }', {
					contentOnly: true
				});
			} else {
				code.overwrite(this.name.end, this.end, `, null`, {
					contentOnly: true
				});
			}
			if (this.selfClosing) {
				code.appendLeft(this.end, ')');
			}
		}
	}
}
