import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionExpression extends FunctionNode {
	type!: NodeType.tFunctionExpression;

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
