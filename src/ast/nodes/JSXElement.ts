import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { getRenderedJsxChildren } from '../../utils/jsx';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type Variable from '../variables/Variable';
import type JSXAttribute from './JSXAttribute';
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
	// TODO Lukas use improved type so that mode and the rest align
	private declare jsxMode: JsxMode;

	// TODO Lukas add import source here
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
		// TODO Lukas extract more this values
		const {
			openingElement: {
				attributes,
				name: { start: nameStart, end: nameEnd },
				selfClosing,
				end,
				start
			},
			factoryVariable
		} = this;
		const [, ...nestedName] = this.factory!.split('.');
		code.update(
			start,
			nameStart,
			`/*#__PURE__*/${[factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.')}(`
		);
		this.openingElement.render(code, options, { jsxMode: this.jsxMode.mode });
		if (attributes.some(attribute => attribute instanceof JSXSpreadAttribute)) {
			if (attributes.length === 1) {
				code.appendLeft(nameEnd, ',');
				code.update(attributes[0].end, end, '');
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
					} else if (inObject) {
						code.appendLeft(attributes[index - 1].end, ',');
					} else {
						code.appendLeft(attributes[index - 1].end, ', {');
						inObject = true;
					}
				}
				if (inObject) {
					code.appendLeft(attributes.at(-1)!.end, ' }');
				}
				code.update(attributes.at(-1)!.end, end, ')');
			}
		} else if (attributes.length > 0) {
			code.appendLeft(nameEnd, ', {');
			for (let index = 0; index < attributes.length - 1; index++) {
				code.appendLeft(attributes[index].end, ', ');
			}
			code.update(attributes.at(-1)!.end, end, ' }');
		} else {
			code.update(nameEnd, end, ', null');
		}
		if (selfClosing) {
			code.appendLeft(end, ')');
		} else {
			for (const child of this.children) {
				if (
					child instanceof JSXExpressionContainer &&
					child.expression instanceof JSXEmptyExpression
				) {
					code.remove(child.start, child.end);
				} else {
					child.render(code, options);
					code.appendLeft(child.start, `, `);
				}
			}
			this.closingElement!.render(code);
		}
	}

	private renderAutomaticMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		// TODO Lukas extract more this values
		const {
			factoryVariable,
			openingElement: {
				attributes,
				end,
				start,
				name: { start: nameStart, end: nameEnd },
				selfClosing
			}
		} = this;
		code.update(
			start,
			nameStart,
			`/*#__PURE__*/${factoryVariable!.getName(getPropertyAccess, useOriginalName)}(`
		);
		this.openingElement.render(code, options, { jsxMode: this.jsxMode.mode });
		// TODO Lukas
		// - render children first
		// - if we have a spread and either regular attributes, a key attribute or children, then we need Object.assign
		// - if we only have a single spread, we just print the object
		// - otherwise we print a regular object
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
		const renderedChildren = getRenderedJsxChildren(this.children);
		let prependComma = false;
		// TODO Lukas can we handle commas differently?
		for (const child of this.children) {
			if (
				child instanceof JSXExpressionContainer &&
				child.expression instanceof JSXEmptyExpression
			) {
				code.remove(child.start, child.end);
			} else {
				child.render(code, options);
				if (prependComma) {
					code.appendLeft(child.start, `, `);
				} else {
					prependComma = true;
				}
			}
		}
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
			if (keyAttribute) {
				const { value } = keyAttribute;
				if (value) {
					code.prependRight(value.start, `${childrenClose} }${closeObjectAssign}, `);
					code.move(value.start, value.end, this.closingElement!.start);
				} else {
					code.prependRight(
						this.closingElement!.start,
						`${childrenClose} }${closeObjectAssign}, true`
					);
				}
			} else {
				// We need to attach to the right as children are not rendered yet and
				// this appendLeft will not append to things appended by the children
				code.prependRight(this.closingElement!.start, `${childrenClose} }${closeObjectAssign}`);
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
		// TODO Lukas inline removal?
		this.closingElement?.render(code);
	}
}
