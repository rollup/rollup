import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { stringifyObjectKeyIfNeeded } from '../../utils/identifierHelpers';
import type { RenderOptions } from '../../utils/renderHelpers';
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

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const key = this.name.name;
			const safeKey = stringifyObjectKeyIfNeeded(key);
			if (key !== safeKey) {
				code.overwrite(this.name.start, this.name.end, safeKey, { contentOnly: true });
			}
			if (this.value) {
				code.overwrite(this.name.end, this.value.start, ': ', { contentOnly: true });
			} else {
				code.appendLeft(this.name.end, ': true');
			}
		}
	}
}
