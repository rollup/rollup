import type MagicString from 'magic-string';
import type { ast, NormalizedJsxOptions } from '../../rollup/types';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type JSXAttribute from './JSXAttribute';
import type JSXSpreadAttribute from './JSXSpreadAttribute';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXOpeningElement extends NodeBase<ast.JSXOpeningElement> {
	parent!: nodes.JSXOpeningElementParent;
	type!: NodeType.tJSXOpeningElement;
	name!: nodes.JSXTagNameExpression;
	attributes!: (JSXAttribute | JSXSpreadAttribute)[];
	selfClosing!: boolean;

	render(
		code: MagicString,
		options: RenderOptions,
		{
			jsxMode = (this.scope.context.options.jsx as NormalizedJsxOptions).mode
		}: NodeRenderOptions = {}
	): void {
		this.name.render(code, options);
		for (const attribute of this.attributes) {
			attribute.render(code, options, { jsxMode });
		}
	}
}

JSXOpeningElement.prototype.includeNode = onlyIncludeSelf;
