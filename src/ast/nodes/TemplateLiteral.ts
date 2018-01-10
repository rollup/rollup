import TemplateElement from './TemplateElement';
import MagicString from 'magic-string';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './index';

export default class TemplateLiteral extends NodeBase {
	type: NodeType.TemplateLiteral;
	quasis: TemplateElement[];
	expressions: ExpressionNode[];

	render (code: MagicString, es: boolean) {
		(<any> code).indentExclusionRanges.push([this.start, this.end]); // TODO TypeScript: Awaiting PR
		super.render(code, es);
	}
}
