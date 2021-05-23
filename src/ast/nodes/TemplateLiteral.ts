import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ObjectPath } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import TemplateElement from './TemplateElement';
import { LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class TemplateLiteral extends NodeBase {
	expressions!: ExpressionNode[];
	quasis!: TemplateElement[];
	type!: NodeType.tTemplateLiteral;

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UnknownValue;
		}
		return this.quasis[0].value.cooked;
	}

	render(code: MagicString, options: RenderOptions): void {
		(code.indentExclusionRanges as [number, number][]).push([this.start, this.end] as [
			number,
			number
		]);
		super.render(code, options);
	}
}
