import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import TemplateElement from './TemplateElement';

export default class TemplateLiteral extends NodeBase {
	expressions: ExpressionNode[];
	quasis: TemplateElement[];
	type: NodeType.tTemplateLiteral;

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UNKNOWN_VALUE;
		}
		return this.quasis[0].value.cooked;
	}

	render(code: MagicString, options: RenderOptions) {
		(code.indentExclusionRanges as [number, number][]).push([this.start, this.end] as [
			number,
			number
		]);
		super.render(code, options);
	}
}
