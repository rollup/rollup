import type JSXClosingFragment from './JSXClosingFragment';
import type JSXElement from './JSXElement';
import type JSXExpressionContainer from './JSXExpressionContainer';
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
}
