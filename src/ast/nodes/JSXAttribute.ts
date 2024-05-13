import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { stringifyObjectKeyIfNeeded } from '../../utils/identifierHelpers';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXElement from './JSXElement';
import type JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import JSXIdentifier from './JSXIdentifier';
import type JSXNamespacedName from './JSXNamespacedName';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXAttribute extends NodeBase {
	type!: NodeType.tJSXAttribute;
	name!: JSXIdentifier | JSXNamespacedName;
	value!: Literal | JSXExpressionContainer | JSXElement | JSXFragment | null;

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const { name, value } = this;
			const key =
				name instanceof JSXIdentifier ? name.name : `${name.namespace.name}:${name.name.name}`;
			const safeKey = stringifyObjectKeyIfNeeded(key);
			if (key !== safeKey) {
				code.overwrite(name.start, name.end, safeKey, { contentOnly: true });
			}
			if (value) {
				code.overwrite(name.end, value.start, ': ', { contentOnly: true });
			} else {
				code.appendLeft(name.end, ': true');
			}
		}
	}
}
