import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXClosingFragment extends NodeBase {
	type!: NodeType.tJSXClosingFragment;

	render(code: MagicString): void {
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		}
	}
}
