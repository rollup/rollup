import Node from '../Node';
import TemplateElement from './TemplateElement';
import Expression from './Expression';
import MagicString from 'magic-string';

export default class TemplateLiteral extends Node {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];

	render (code: MagicString, es: boolean) {
		(<any> code).indentExclusionRanges.push([this.start, this.end]); // TODO TypeScript: Awaiting PR
		super.render(code, es);
	}
}
