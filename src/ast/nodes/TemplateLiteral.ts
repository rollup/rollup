import Node from '../Node';
import TemplateElement from './TemplateElement';
import Expression from './Expression';
import MagicString from 'magic-string';

export default class TemplateLiteral extends Node {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];

	render (code: MagicString, es: boolean) {
		code.indentExclusionRanges.push([this.start, this.end]);
		super.render(code, es);
	}
}
