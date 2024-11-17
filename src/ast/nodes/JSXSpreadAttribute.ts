import type MagicString from 'magic-string';
import type { ast, NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXSpreadAttribute extends NodeBase<ast.JSXSpreadAttribute> {
	parent!: nodes.JSXSpreadAttributeParent;
	type!: NodeType.tJSXSpreadAttribute;
	argument!: nodes.Expression;

	render(code: MagicString, options: RenderOptions): void {
		this.argument.render(code, options);
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.argument.start, '', { contentOnly: true });
			code.overwrite(this.argument.end, this.end, '', { contentOnly: true });
		}
	}
}
