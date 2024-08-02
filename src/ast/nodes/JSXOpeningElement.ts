import type MagicString from 'magic-string';
import type {
	NormalizedJsxAutomaticOptions,
	NormalizedJsxClassicOptions,
	NormalizedJsxOptions
} from '../../rollup/types';
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
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		switch (jsx.mode) {
			case 'classic': {
				this.renderClassicMode(code, options, jsx);
				break;
			}
			case 'automatic': {
				this.renderAutomaticMode(code, options, jsx);
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

	private renderAutomaticMode(
		code: MagicString,
		options: RenderOptions,
		jsx: NormalizedJsxAutomaticOptions
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
		code.overwrite(
			start,
			nameStart,
			`/*#__PURE__*/${factoryVariable!.getName(getPropertyAccess, useOriginalName)}(`,
			{ contentOnly: true }
		);
		const [regularAttributes, hasSpread, keyAttribute] = analyzeAttributes(jsx.mode, attributes);
		if (hasSpread) {
			if (regularAttributes.length === 1) {
				code.appendLeft(nameEnd, ',');
				code.overwrite(attributes.at(-1)!.end, end, '', { contentOnly: true });
			} else {
				code.appendLeft(nameEnd, ', Object.assign(');
				let inObject = false;
				if (!(regularAttributes[0] instanceof JSXSpreadAttribute)) {
					code.appendLeft(nameEnd, '{');
					inObject = true;
				}
				for (let index = 1; index < regularAttributes.length; index++) {
					const attribute = regularAttributes[index];
					if (attribute instanceof JSXSpreadAttribute) {
						if (inObject) {
							code.prependRight(attribute.start, '}, ');
							inObject = false;
						} else {
							code.appendLeft(regularAttributes[index - 1].end, ',');
						}
					} else {
						if (inObject) {
							code.appendLeft(regularAttributes[index - 1].end, ',');
						} else {
							code.appendLeft(regularAttributes[index - 1].end, ', {');
							inObject = true;
						}
					}
				}
				if (inObject) {
					code.appendLeft(attributes.at(-1)!.end, ' }');
				}
				code.overwrite(attributes.at(-1)!.end, end, ')', { contentOnly: true });
			}
		} else if (regularAttributes.length > 0) {
			code.appendLeft(nameEnd, ', {');
			for (let index = 0; index < regularAttributes.length - 1; index++) {
				code.appendLeft(regularAttributes[index].end, ', ');
			}
			code.overwrite(attributes.at(-1)!.end, end, ' }', {
				contentOnly: true
			});
		} else if (keyAttribute) {
			code.remove(nameEnd, keyAttribute.start);
			code.overwrite(keyAttribute.end, end, `, {}`, {
				contentOnly: true
			});
		} else {
			code.overwrite(nameEnd, end, `, {}`, {
				contentOnly: true
			});
		}
		if (selfClosing) {
			if (keyAttribute) {
				const { value } = keyAttribute;
				// This will appear to the left of the moved code...
				code.appendLeft(end, ', ');
				if (value) {
					// ...and this will appear to the right
					code.appendLeft(value.end, ')');
					code.move(value.start, value.end, end);
				} else {
					code.appendLeft(end, 'true)');
				}
			} else {
				code.appendLeft(end, ')');
			}
		}
	}
}

function analyzeAttributes(
	mode: 'automatic' | 'classic',
	attributes: (JSXAttribute | JSXSpreadAttribute)[]
): [
	regularAttributes: (JSXAttribute | JSXSpreadAttribute)[],
	hasSpread: boolean,
	keyAttribute: JSXAttribute | null
] {
	const extractKey = mode === 'automatic';
	const regularAttributes: (JSXAttribute | JSXSpreadAttribute)[] = [];
	let keyAttribute: JSXAttribute | null = null;
	let hasSpread = false;
	for (const attribute of attributes) {
		if (attribute instanceof JSXSpreadAttribute) {
			hasSpread = true;
			regularAttributes.push(attribute);
		} else if (extractKey && attribute.name.name === 'key') {
			keyAttribute = attribute;
		} else {
			regularAttributes.push(attribute);
		}
	}
	return [regularAttributes, hasSpread, keyAttribute];
}
