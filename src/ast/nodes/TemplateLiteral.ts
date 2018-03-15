import TemplateElement from './TemplateElement';
import MagicString from 'magic-string';
import { ExpressionNode, Node, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../utils/renderHelpers';

export function isTemplateLiteral(node: Node): node is TemplateLiteral {
	return node.type === NodeType.TemplateLiteral;
}

export default class TemplateLiteral extends NodeBase {
	type: NodeType.TemplateLiteral;
	quasis: TemplateElement[];
	expressions: ExpressionNode[];

	render(code: MagicString, options: RenderOptions) {
		(<[number, number][]>code.indentExclusionRanges).push(<[number, number]>[this.start, this.end]);
		super.render(code, options);
	}
}
