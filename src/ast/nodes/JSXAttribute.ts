import type JSXElement from './JSXElement';
import type JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import type JSXIdentifier from './JSXIdentifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXAttribute extends NodeBase {
	type!: NodeType.tJSXAttribute;
	name!: JSXIdentifier /* TODO | JSXNamespacedName */;
	value!: Literal | JSXExpressionContainer | JSXElement | JSXFragment | null;
}
