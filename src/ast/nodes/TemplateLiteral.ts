import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext } from '../ExecutionContext';
import { INTERACTION_ACCESSED, INTERACTION_CALLED, NodeInteraction } from '../NodeInteractions';
import type { ObjectPath } from '../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	literalStringMembers
} from '../values';
import type * as NodeType from './NodeType';
import type TemplateElement from './TemplateElement';
import {
	ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class TemplateLiteral extends NodeBase {
	declare expressions: ExpressionNode[];
	declare quasis: TemplateElement[];
	declare type: NodeType.tTemplateLiteral;

	deoptimizeThisOnInteractionAtPath(): void {}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UnknownValue;
		}
		return this.quasis[0].value.cooked;
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
		if (path.length !== 1) {
			return UNKNOWN_EXPRESSION;
		}
		return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (interaction.type === INTERACTION_ACCESSED) {
			return path.length > 1;
		}
		if (interaction.type === INTERACTION_CALLED && path.length === 1) {
			return hasMemberEffectWhenCalled(literalStringMembers, path[0], interaction, context);
		}
		return true;
	}

	render(code: MagicString, options: RenderOptions): void {
		(code.indentExclusionRanges as [number, number][]).push([this.start, this.end]);
		super.render(code, options);
	}
}
