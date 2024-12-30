import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED, INTERACTION_CALLED } from '../NodeInteractions';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	literalStringMembers
} from '../values';
import type * as NodeType from './NodeType';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { UNKNOWN_RETURN_EXPRESSION, UnknownValue } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';
import type TemplateElement from './TemplateElement';

export default class TemplateLiteral extends NodeBase {
	declare expressions: ExpressionNode[];
	declare quasis: TemplateElement[];
	declare type: NodeType.tTemplateLiteral;

	deoptimizeArgumentsOnInteractionAtPath(): void {}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0 || this.quasis.length !== 1) {
			return UnknownValue;
		}
		return this.quasis[0].value.cooked;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length !== 1) {
			return UNKNOWN_RETURN_EXPRESSION;
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

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		for (const node of this.expressions) {
			node.includePath(UNKNOWN_PATH, context);
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		(code.indentExclusionRanges as [number, number][]).push([this.start, this.end]);
		super.render(code, options);
	}
}
