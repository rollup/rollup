import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';

export default class ClassExpression extends ClassNode {
	type!: NodeType.tClassExpression;

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, renderedSurroundingElement }: NodeRenderOptions = BLANK
	) {
		super.render(code, options);
		const surroundingElement = renderedParentType || renderedSurroundingElement;
		if (surroundingElement === NodeType.ExpressionStatement) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}
}
