import type JSXElement from '../ast/nodes/JSXElement';
import JSXEmptyExpression from '../ast/nodes/JSXEmptyExpression';
import JSXExpressionContainer from '../ast/nodes/JSXExpressionContainer';
import type JSXFragment from '../ast/nodes/JSXFragment';
import type JSXSpreadChild from '../ast/nodes/JSXSpreadChild';
import JSXText from '../ast/nodes/JSXText';

export function getRenderedJsxChildren(
	children: (JSXText | JSXExpressionContainer | JSXElement | JSXFragment | JSXSpreadChild)[]
) {
	let renderedChildren = 0;
	for (const child of children) {
		if (
			!(
				child instanceof JSXExpressionContainer && child.expression instanceof JSXEmptyExpression
			) &&
			(!(child instanceof JSXText) || child.shouldRender())
		) {
			renderedChildren++;
		}
	}
	return renderedChildren;
}
