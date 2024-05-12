import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXClosingFragment from './JSXClosingFragment';
import type JSXElement from './JSXElement';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import type JSXOpeningFragment from './JSXOpeningFragment';
import type JSXText from './JSXText';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxElement extends NodeBase {
	type!: NodeType.tJSXElement;
	openingFragment!: JSXOpeningFragment;
	children!: (
		| JSXText
		| JSXExpressionContainer /* TODO | JSXSpreadChild */
		| JSXElement
		| JSXFragment
	)[];
	closingFragment!: JSXClosingFragment;

	render(code: MagicString, options: RenderOptions): void {
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (preserve) {
			super.render(code, options);
		} else {
			this.openingFragment.render(code, options);
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
			this.closingFragment?.render(code);
		}
	}
}
