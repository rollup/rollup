import type { ast } from '../../rollup/types';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import JSXClosingBase from './shared/JSXClosingBase';

export default class JSXClosingElement extends JSXClosingBase<ast.JSXClosingElement> {
	type!: NodeType.tJSXClosingElement;
	name!: nodes.JSXTagNameExpression;
}
