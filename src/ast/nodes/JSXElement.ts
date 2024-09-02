import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { getRenderedJsxChildren } from '../../utils/jsx';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type Variable from '../variables/Variable';
import JSXAttribute from './JSXAttribute';
import type JSXClosingElement from './JSXClosingElement';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import type JSXOpeningElement from './JSXOpeningElement';
import JSXSpreadAttribute from './JSXSpreadAttribute';
import type JSXSpreadChild from './JSXSpreadChild';
import type JSXText from './JSXText';
import type * as NodeType from './NodeType';
import JSXElementBase from './shared/JSXElementBase';
import type { IncludeChildren } from './shared/Node';

type JsxMode =
	| {
			mode: 'preserve' | 'classic';
			factory: string | null;
			importSource: string | null;
	  }
	| { mode: 'automatic'; factory: string; importSource: string };

export default class JSXElement extends JSXElementBase {
	type!: NodeType.tJSXElement;
	openingElement!: JSXOpeningElement;
	closingElement!: JSXClosingElement | null;
	children!: (JSXText | JSXExpressionContainer | JSXElement | JSXFragment | JSXSpreadChild)[];

	private factoryVariable: Variable | null = null;
	private factory: string | null = null;
	private declare jsxMode: JsxMode;

	initialise() {
		super.initialise();
		const { importSource } = (this.jsxMode = this.getRenderingMode());
		if (importSource) {
			this.scope.context.addImportSource(importSource);
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			const { factory, importSource, mode } = this.jsxMode;
			if (importSource) {
				this.scope.context.addImportSource(importSource);
			}
			if (factory) {
				this.factory = factory;
				this.factoryVariable = this.getAndIncludeFactoryVariable(
					factory,
					mode === 'preserve',
					importSource
				);
			}
		}
		super.include(context, includeChildrenRecursively);
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

	private getRenderingMode(): JsxMode {
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
			return {
				factory: getRenderedJsxChildren(this.children) > 1 ? 'jsxs' : 'jsx',
				importSource: jsx.jsxImportSource,
				mode
			};
		}
		return { factory, importSource, mode };
	}

	private renderClassicMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const {
			children,
			closingElement,
			end,
			factory,
			factoryVariable,
			openingElement: { end: openingEnd, selfClosing }
		} = this;
		const [, ...nestedName] = factory!.split('.');
		let { firstAttribute, hasAttributes, hasSpread, inObject, previousEnd } = this.renderAttributes(
			code,
			options,
			[factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.'),
			false
		);

		if (inObject) {
			code.appendLeft(previousEnd, ' }');
		}
		if (hasSpread) {
			if (hasAttributes) {
				const { start } = firstAttribute!;
				if (firstAttribute instanceof JSXSpreadAttribute) {
					code.prependRight(start, '{}, ');
				}
				code.prependRight(start, 'Object.assign(');
				code.appendLeft(previousEnd, ')');
			}
		} else if (!hasAttributes) {
			code.appendLeft(previousEnd, ', null');
		}

		previousEnd = openingEnd;
		for (const child of children) {
			if (
				child instanceof JSXExpressionContainer &&
				child.expression instanceof JSXEmptyExpression
			) {
				code.remove(previousEnd, child.end);
			} else {
				code.appendLeft(previousEnd, ', ');
				child.render(code, options);
			}
			previousEnd = child.end;
		}

		if (selfClosing) {
			code.appendLeft(end, ')');
		} else {
			closingElement!.render(code);
		}
	}

	private renderAutomaticMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const {
			children,
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
		let hasChildren = false;
		let hasMultipleChildren = false;
		let childrenStart = 0;
		previousEnd = openingEnd;
		for (const child of children) {
			if (
				child instanceof JSXExpressionContainer &&
				child.expression instanceof JSXEmptyExpression
			) {
				code.remove(previousEnd, child.end);
			} else {
				code.appendLeft(previousEnd, ', ');
				child.render(code, options);
				if (hasChildren) {
					hasMultipleChildren = true;
				} else {
					hasChildren = true;
					childrenStart = child.start;
				}
			}
			previousEnd = child.end;
		}
		// Wrap the children now and update previousEnd before continuing
		if (hasChildren) {
			code.prependRight(childrenStart, `children: ${hasMultipleChildren ? '[' : ''}`);
			if (!inObject) {
				code.prependRight(childrenStart, '{ ');
				inObject = true;
			}
			previousEnd = closingElement!.start;
			if (hasMultipleChildren) {
				code.appendLeft(previousEnd, ']');
			}
		}
		// This is the outside wrapping
		if (inObject) {
			code.appendLeft(previousEnd, ' }');
		}
		if (hasSpread) {
			// This is the only case where we need Object.assign
			if (hasAttributes || hasChildren) {
				const start = firstAttribute?.start || childrenStart;
				if (firstAttribute instanceof JSXSpreadAttribute) {
					code.prependRight(start, '{}, ');
				}
				code.prependRight(start, 'Object.assign(');
				code.appendLeft(previousEnd, ')');
			}
		} else if (!(hasAttributes || hasChildren)) {
			code.appendLeft(previousEnd, ', {}');
		}

		if (keyAttribute) {
			const { value } = keyAttribute;
			// This will appear to the left of the moved code...
			code.appendLeft(previousEnd, ', ');
			if (value) {
				code.move(value.start, value.end, previousEnd);
			} else {
				code.appendLeft(previousEnd, 'true');
			}
		}

		if (selfClosing) {
			// Moving the key attribute will
			code.appendLeft(keyAttribute?.value?.end || end, ')');
		} else {
			closingElement!.render(code);
		}
	}

	private renderAttributes(
		code: MagicString,
		options: RenderOptions,
		factoryName: string,
		extractKeyAttribute: boolean
	) {
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
			if (!firstAttribute) {
				firstAttribute = attribute;
			}
		}
		code.remove(attributes.at(-1)?.end || previousEnd, openingEnd);
		return { firstAttribute, hasAttributes, hasSpread, inObject, keyAttribute, previousEnd };
	}
}
