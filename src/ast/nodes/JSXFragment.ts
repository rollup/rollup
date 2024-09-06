import type MagicString from 'magic-string';
import { getRenderedJsxChildren } from '../../utils/jsx';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXClosingFragment from './JSXClosingFragment';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
import type JSXOpeningFragment from './JSXOpeningFragment';
import type * as NodeType from './NodeType';
import JSXElementBase from './shared/JSXElementBase';
import type { JSXChild } from './shared/jsxHelpers';

export default class JSXFragment extends JSXElementBase {
	type!: NodeType.tJSXElement;
	openingFragment!: JSXOpeningFragment;
	children!: JSXChild[];
	closingFragment!: JSXClosingFragment;

	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.jsxMode;
		if (mode === 'preserve') {
			super.render(code, options);
		} else {
			const {
				snippets: { getPropertyAccess },
				useOriginalName
			} = options;
			const [, ...nestedFactory] = this.factory!.split('.');
			const factory = [
				this.factoryVariable!.getName(getPropertyAccess, useOriginalName),
				...nestedFactory
			].join('.');
			this.openingFragment.render(code, options);
			code.prependRight(this.start, `/*#__PURE__*/${factory}(`);
			code.appendLeft(this.openingFragment.end, ', ');
			if (mode === 'classic') {
				code.appendLeft(this.openingFragment.end, 'null');
			} else {
				code.appendLeft(this.openingFragment.end, '{');
				const renderedChildren = getRenderedJsxChildren(this.children);
				if (renderedChildren > 0) {
					code.appendLeft(
						this.openingFragment.end,
						` children: ${renderedChildren > 1 ? '[' : ''}`
					);
				}
				code.prependRight(
					this.closingFragment.start,
					`${renderedChildren > 1 ? '] ' : renderedChildren > 0 ? ' ' : ''}}`
				);
			}
			let prependComma = mode === 'classic';
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
			this.closingFragment?.render(code);
		}
	}
}
