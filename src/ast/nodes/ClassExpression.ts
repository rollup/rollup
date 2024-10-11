import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';

export default class ClassExpression extends ClassNode<ast.ClassExpression> {
	type!: NodeType.tClassExpression;

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		super.render(code, options);
		if (renderedSurroundingElement === NodeType.ExpressionStatement) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}
}
