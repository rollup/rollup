import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { stringifyObjectKeyIfNeeded } from '../../utils/identifierHelpers';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type JSXElement from './JSXElement';
import type JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import JSXIdentifier from './JSXIdentifier';
import type JSXNamespacedName from './JSXNamespacedName';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXAttribute extends NodeBase {
	type!: NodeType.tJSXAttribute;
	name!: JSXIdentifier | JSXNamespacedName;
	value!: Literal | JSXExpressionContainer | JSXElement | JSXFragment | null;

	render(code: MagicString, options: RenderOptions, { jsxMode }: NodeRenderOptions = BLANK): void {
		super.render(code, options);
		if ((['classic', 'automatic'] as (string | undefined)[]).includes(jsxMode)) {
			const { name, value } = this;
			const key =
				name instanceof JSXIdentifier ? name.name : `${name.namespace.name}:${name.name.name}`;
			if (!(jsxMode === 'automatic' && key === 'key')) {
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
}

JSXAttribute.prototype.includeNode = onlyIncludeSelf;
