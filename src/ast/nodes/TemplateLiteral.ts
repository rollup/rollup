import Node from '../Node';
import TemplateElement from './TemplateElement';
import Expression from './Expression';

export default class TemplateLiteral extends Node {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];

	render (code, es) {
		code.indentExclusionRanges.push([this.start, this.end]);
		super.render(code, es);
	}
}
