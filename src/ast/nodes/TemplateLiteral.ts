import TemplateElement from './TemplateElement';
import MagicString from 'magic-string';
import { ExpressionNode, Node, NodeBase } from './shared/Node';
import * as NodeType from './NodeType';
import { RenderOptions } from '../../utils/renderHelpers';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../values';

export function isTemplateLiteral(node: Node): node is TemplateLiteral {
	return node.type === NodeType.TemplateLiteral;
}

export default class TemplateLiteral extends NodeBase {
	type: NodeType.tTemplateLiteral;
	quasis: TemplateElement[];
	expressions: ExpressionNode[];

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UNKNOWN_VALUE;
		}
		return this.quasis[0].value.cooked;
	}

	render(code: MagicString, options: RenderOptions) {
		(<[number, number][]>code.indentExclusionRanges).push(<[number, number]>[this.start, this.end]);
		super.render(code, options);
	}
}
