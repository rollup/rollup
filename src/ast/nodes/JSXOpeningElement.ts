import type MagicString from 'magic-string';
import type { NormalizedJsxClassicOptions, NormalizedJsxOptions } from '../../rollup/types';
import { getRenderedJsxChildren } from '../../utils/jsx';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXAttribute from './JSXAttribute';
import JSXElement from './JSXElement';
import type JSXFragment from './JSXFragment';
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
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		switch (jsx.mode) {
			case 'classic': {
				this.renderClassicMode(code, options, jsx);
				break;
			}
			case 'automatic': {
				this.renderAutomaticMode(code, options);
				break;
			}
		}
	}

	private renderClassicMode(
		code: MagicString,
		options: RenderOptions,
		{ factory }: NormalizedJsxClassicOptions
	) {
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
			code.overwrite(nameEnd, end, ', null', {
				contentOnly: true
			});
		}
		if (selfClosing) {
			code.appendLeft(end, ')');
		}
	}

	private renderAutomaticMode(code: MagicString, options: RenderOptions) {
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
		code.overwrite(
			start,
			nameStart,
			`/*#__PURE__*/${factoryVariable!.getName(getPropertyAccess, useOriginalName)}(`,
			{ contentOnly: true }
		);
		let keyAttribute: JSXAttribute | null = null;
		let hasSpread = false;
		let inObject = true;
		let previousEnd = nameEnd;
		let hasAttributes = false;
		for (const attribute of attributes) {
			if (attribute instanceof JSXSpreadAttribute) {
				if (inObject) {
					if (hasAttributes) {
						code.appendLeft(previousEnd, ' ');
					}
					code.appendLeft(previousEnd, '},');
					inObject = false;
				} else if (hasAttributes) {
					code.appendLeft(previousEnd, ',');
				}
				previousEnd = attribute.end;
				hasAttributes = true;
				hasSpread = true;
			} else if (attribute.name.name === 'key') {
				keyAttribute = attribute;
				code.remove(previousEnd, attribute.value?.start || attribute.end);
			} else {
				if (hasAttributes) {
					code.appendLeft(previousEnd, ',');
				}
				if (!inObject) {
					code.appendLeft(previousEnd, ' {');
					inObject = true;
				}
				previousEnd = attribute.end;
				hasAttributes = true;
			}
		}
		code.prependLeft(nameEnd, hasSpread ? ', Object.assign({' : ', {');
		const closeObjectAssign = hasSpread ? ')' : '';
		const parent = this.parent as JSXElement | JSXFragment;
		const renderedChildren = getRenderedJsxChildren(parent.children);
		if (renderedChildren > 0) {
			if (hasAttributes) {
				code.appendLeft(previousEnd, ',');
			}
			if (!inObject) {
				code.appendLeft(previousEnd, ' {');
			}
			code.update(
				attributes.at(-1)?.end || previousEnd,
				end,
				` children: ${renderedChildren > 1 ? '[' : ''}`
			);
			const childrenClose = renderedChildren > 1 ? ']' : '';
			const closingElementStart =
				parent instanceof JSXElement ? parent.closingElement!.start : parent.closingFragment!.start;
			if (keyAttribute) {
				const { value } = keyAttribute;
				if (value) {
					code.prependRight(value.start, `${childrenClose} }${closeObjectAssign}, `);
					code.move(value.start, value.end, closingElementStart);
				} else {
					code.prependRight(closingElementStart, `${childrenClose} }${closeObjectAssign}, true`);
				}
			} else {
				// We need to attach to the right as children are not rendered yet and
				// this appendLeft will not append to things appended by the children
				code.prependRight(closingElementStart, `${childrenClose} }${closeObjectAssign}`);
			}
		} else {
			if (inObject) {
				if (hasAttributes) {
					code.appendLeft(previousEnd, ' ');
				}
				code.update(attributes.at(-1)?.end || previousEnd, end, '}' + closeObjectAssign);
			} else {
				code.update(previousEnd, end, ')');
			}
			if (keyAttribute) {
				const { value } = keyAttribute;
				// This will appear to the left of the moved code...
				code.appendLeft(end, ', ');
				if (value) {
					if (selfClosing) {
						// ...and this will appear to the right
						code.appendLeft(value.end, ')');
					}
					code.move(value.start, value.end, end);
				} else {
					code.appendLeft(end, 'true');
					if (selfClosing) {
						code.appendLeft(end, ')');
					}
				}
			} else if (selfClosing) {
				code.appendLeft(end, ')');
			}
		}
	}
}
