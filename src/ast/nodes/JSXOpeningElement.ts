import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXAttribute from './JSXAttribute';
import type JSXIdentifier from './JSXIdentifier';
import type JSXMemberExpression from './JSXMemberExpression';
import type JSXNamespacedName from './JSXNamespacedName';
import JSXSpreadAttribute from './JSXSpreadAttribute';
import type * as NodeType from './NodeType';
import JSXOpeningBase from './shared/JSXOpeningBase';

export default class JSXOpeningElement extends JSXOpeningBase {
	type!: NodeType.tJSXOpeningElement;
	name!: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
	attributes!: (JSXAttribute | JSXSpreadAttribute)[];
	selfClosing!: boolean;

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const { factory, preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const {
				snippets: { getPropertyAccess },
				useOriginalName
			} = options;
			const {
				attributes,
				end,
				factoryVariable,
				name: { start: nameStart, end: nameEnd },
				selfClosing,
				start
			} = this;
			const [, ...nestedName] = factory.split('.');
			code.overwrite(
				start,
				nameStart,
				`/*#__PURE__*/${[factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.')}(`,
				{ contentOnly: true }
			);
			if (attributes.some(attribute => attribute instanceof JSXSpreadAttribute)) {
				if (attributes.length === 1) {
					code.appendLeft(nameEnd, ',');
					code.overwrite(attributes[0].end, end, '', { contentOnly: true });
				} else {
					code.appendLeft(nameEnd, ', Object.assign(');
					let inObject = false;
					if (!(attributes[0] instanceof JSXSpreadAttribute)) {
						code.appendLeft(nameEnd, '{');
						inObject = true;
					}
					for (let index = 1; index < attributes.length; index++) {
						const attribute = attributes[index];
						if (attribute instanceof JSXSpreadAttribute) {
							if (inObject) {
								code.prependRight(attribute.start, '}, ');
								inObject = false;
							} else {
								code.appendLeft(attributes[index - 1].end, ',');
							}
						} else {
							if (inObject) {
								code.appendLeft(attributes[index - 1].end, ',');
							} else {
								code.appendLeft(attributes[index - 1].end, ', {');
								inObject = true;
							}
						}
					}
					if (inObject) {
						code.appendLeft(attributes.at(-1)!.end, ' }');
					}
					code.overwrite(attributes.at(-1)!.end, end, ')', { contentOnly: true });
				}
			} else if (attributes.length > 0) {
				code.appendLeft(nameEnd, ', {');
				for (let index = 0; index < attributes.length - 1; index++) {
					code.appendLeft(attributes[index].end, ', ');
				}
				code.overwrite(attributes.at(-1)!.end, end, ' }', {
					contentOnly: true
				});
			} else {
				code.overwrite(nameEnd, end, `, null`, {
					contentOnly: true
				});
			}
			if (selfClosing) {
				code.appendLeft(end, ')');
			}
		}
	}
}
