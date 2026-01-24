import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXSpreadAttribute extends NodeBase {
	declare type: NodeType.tJSXSpreadAttribute;
	declare argument: ExpressionNode;

	render(code: MagicString, options: RenderOptions): void {
		this.argument.render(code, options);
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.argument.start, '', { contentOnly: true });
			code.overwrite(this.argument.end, this.end, '', { contentOnly: true });
		}
	}
}
