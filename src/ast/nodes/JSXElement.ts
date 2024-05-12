import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXClosingElement from './JSXClosingElement';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import type JSXOpeningElement from './JSXOpeningElement';
import type JSXText from './JSXText';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXElement extends NodeBase {
	type!: NodeType.tJSXElement;
	openingElement!: JSXOpeningElement;
	closingElement!: JSXClosingElement | null;
	children!: (
		| JSXText
		| JSXExpressionContainer
		| JSXElement
		| JSXFragment
	) /* TODO | JSXSpreadChild */[];

	render(code: MagicString, options: RenderOptions): void {
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (preserve) {
			super.render(code, options);
		} else {
			this.openingElement.render(code, options);
			for (const child of this.children) {
				if (
					child instanceof JSXExpressionContainer &&
					child.expression instanceof JSXEmptyExpression
				) {
					code.remove(child.start, child.end);
				} else {
					child.render(code, options);
					code.appendRight(child.start, `, `);
				}
			}
			this.closingElement?.render(code);
		}
	}
}
