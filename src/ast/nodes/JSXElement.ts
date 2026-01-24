import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import JSXAttribute from './JSXAttribute';
import type JSXClosingElement from './JSXClosingElement';
import type JSXOpeningElement from './JSXOpeningElement';
import JSXSpreadAttribute from './JSXSpreadAttribute';
import type * as NodeType from './NodeType';
import JSXElementBase from './shared/JSXElementBase';
import type { JSXChild, JsxMode } from './shared/jsxHelpers';
import type { IncludeChildren } from './shared/Node';

export default class JSXElement extends JSXElementBase {
	declare type: NodeType.tJSXElement;
	declare openingElement: JSXOpeningElement;
	declare closingElement: JSXClosingElement | null;
	declare children: JSXChild[];

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		super.include(context, includeChildrenRecursively);
		this.openingElement.include(context, includeChildrenRecursively);
		this.closingElement?.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions): void {
		switch (this.jsxMode.mode) {
			case 'classic': {
				this.renderClassicMode(code, options);
				break;
			}
			case 'automatic': {
				this.renderAutomaticMode(code, options);
				break;
			}
			default: {
				super.render(code, options);
			}
		}
	}

	protected getRenderingMode(): JsxMode {
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		const { mode, factory, importSource } = jsx;
		if (mode === 'automatic') {
			// In the case there is a key after a spread attribute, we fall back to
			// classic mode, see https://github.com/facebook/react/issues/20031#issuecomment-710346866
			// for reasoning.
			let hasSpread = false;
			for (const attribute of this.openingElement.attributes) {
				if (attribute instanceof JSXSpreadAttribute) {
					hasSpread = true;
				} else if (hasSpread && attribute.name.name === 'key') {
					return { factory, importSource, mode: 'classic' };
				}
			}
		}
		return super.getRenderingMode();
	}

	private renderClassicMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const {
			closingElement,
			end,
			factory,
			factoryVariable,
			openingElement: { end: openingEnd, selfClosing }
		} = this;
		const [, ...nestedName] = factory!.split('.');
		const { firstAttribute, hasAttributes, hasSpread, inObject, previousEnd } =
			this.renderAttributes(
				code,
				options,
				[factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.'),
				false
			);

		this.wrapAttributes(
			code,
			inObject,
			hasAttributes,
			hasSpread,
			firstAttribute,
			'null',
			previousEnd
		);

		this.renderChildren(code, options, openingEnd);

		if (selfClosing) {
			code.appendLeft(end, ')');
		} else {
			closingElement!.render(code, options);
		}
	}

	private renderAutomaticMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const {
			closingElement,
			end,
			factoryVariable,
			openingElement: { end: openingEnd, selfClosing }
		} = this;
		let { firstAttribute, hasAttributes, hasSpread, inObject, keyAttribute, previousEnd } =
			this.renderAttributes(
				code,
				options,
				factoryVariable!.getName(getPropertyAccess, useOriginalName),
				true
			);

		const { firstChild, hasMultipleChildren, childrenEnd } = this.renderChildren(
			code,
			options,
			openingEnd
		);

		if (firstChild) {
			code.prependRight(firstChild.start, `children: ${hasMultipleChildren ? '[' : ''}`);
			if (!inObject) {
				code.prependRight(firstChild.start, '{ ');
				inObject = true;
			}
			previousEnd = closingElement!.start;
			if (hasMultipleChildren) {
				code.appendLeft(previousEnd, ']');
			}
		}

		// This ensures that attributesEnd never corresponds to this.end. This is
		// important because we must never use code.move with this.end as target.
		// Otherwise, this would interfere with parent elements that try to append
		// code to this.end, which would appear BEFORE the moved code.
		const attributesEnd = firstChild ? childrenEnd : previousEnd;
		this.wrapAttributes(
			code,
			inObject,
			hasAttributes || !!firstChild,
			hasSpread,
			firstAttribute || firstChild,
			'{}',
			attributesEnd
		);

		if (keyAttribute) {
			const { value } = keyAttribute;
			// This will appear to the left of the moved code...
			code.appendLeft(attributesEnd, ', ');
			if (value) {
				code.move(value.start, value.end, attributesEnd);
			} else {
				code.appendLeft(attributesEnd, 'true');
			}
		}

		if (selfClosing) {
			// Moving the key attribute will also move the parenthesis to the right position
			code.appendLeft(keyAttribute?.value?.end || end, ')');
		} else {
			closingElement!.render(code, options);
		}
	}

	private renderAttributes(
		code: MagicString,
		options: RenderOptions,
		factoryName: string,
		extractKeyAttribute: boolean
	): {
		firstAttribute: JSXAttribute | JSXSpreadAttribute | JSXChild | null;
		hasAttributes: boolean;
		hasSpread: boolean;
		inObject: boolean;
		keyAttribute: JSXAttribute | null;
		previousEnd: number;
	} {
		const {
			jsxMode: { mode },
			openingElement
		} = this;
		const {
			attributes,
			end: openingEnd,
			start: openingStart,
			name: { start: nameStart, end: nameEnd }
		} = openingElement;
		code.update(openingStart, nameStart, `/*#__PURE__*/${factoryName}(`);
		openingElement.render(code, options, { jsxMode: mode });
		let keyAttribute: JSXAttribute | null = null;
		let hasSpread = false;
		let inObject = false;
		let previousEnd = nameEnd;
		let hasAttributes = false;
		let firstAttribute: JSXAttribute | JSXSpreadAttribute | null = null;
		for (const attribute of attributes) {
			if (attribute instanceof JSXAttribute) {
				if (extractKeyAttribute && attribute.name.name === 'key') {
					keyAttribute = attribute;
					code.remove(previousEnd, attribute.value?.start || attribute.end);
					continue;
				}
				code.appendLeft(previousEnd, ',');
				if (!inObject) {
					code.prependRight(attribute.start, '{ ');
					inObject = true;
				}
				hasAttributes = true;
			} else {
				if (inObject) {
					if (hasAttributes) {
						code.appendLeft(previousEnd, ' ');
					}
					code.appendLeft(previousEnd, '},');
					inObject = false;
				} else {
					code.appendLeft(previousEnd, ',');
				}
				hasSpread = true;
			}
			previousEnd = attribute.end;
			firstAttribute ??= attribute;
		}
		code.remove(attributes.at(-1)?.end || previousEnd, openingEnd);
		return { firstAttribute, hasAttributes, hasSpread, inObject, keyAttribute, previousEnd };
	}

	private wrapAttributes(
		code: MagicString,
		inObject: boolean,
		hasAttributes: boolean,
		hasSpread: boolean,
		firstAttribute: JSXAttribute | JSXSpreadAttribute | JSXChild | null,
		missingAttributesFallback: string,
		attributesEnd: number
	) {
		if (inObject) {
			code.appendLeft(attributesEnd, ' }');
		}
		if (hasSpread) {
			if (hasAttributes) {
				const { start } = firstAttribute!;
				if (firstAttribute instanceof JSXSpreadAttribute) {
					code.prependRight(start, '{}, ');
				}
				code.prependRight(start, 'Object.assign(');
				code.appendLeft(attributesEnd, ')');
			}
		} else if (!hasAttributes) {
			code.appendLeft(attributesEnd, `, ${missingAttributesFallback}`);
		}
	}
}
