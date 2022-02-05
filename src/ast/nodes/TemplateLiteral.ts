import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { ObjectPath } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type TemplateElement from './TemplateElement';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class TemplateLiteral extends NodeBase {
	declare expressions: ExpressionNode[];
	declare quasis: TemplateElement[];
	declare type: NodeType.tTemplateLiteral;

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UnknownValue;
		}
		return this.quasis[0].value.cooked;
	}

	render(code: MagicString, options: RenderOptions): void {
		(code.indentExclusionRanges as [number, number][]).push([this.start, this.end]);
		super.render(code, options);
	}
}
