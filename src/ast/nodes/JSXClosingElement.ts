import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXClosingElement extends NodeBase {
	type!: NodeType.tJSXClosingElement;
	name!: JSXIdentifier /* TODO | JSXMemberExpression | JSXNamespacedName */;

	render(code: MagicString): void {
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		}
	}
}
