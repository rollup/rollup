import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	RenderOptions
} from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { ObjectPath } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class VariableDeclarator extends NodeBase {
	id!: PatternNode;
	init!: ExpressionNode | null;
	type!: NodeType.tVariableDeclarator;

	declareDeclarator(kind: string) {
		this.id.declare(kind, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath) {
		this.id.deoptimizePath(path);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.id.hasEffects(context) || (this.init !== null && this.init.hasEffects(context));
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (includeChildrenRecursively || this.id.shouldBeIncluded(context)) {
			this.id.include(context, includeChildrenRecursively);
		}
		if (this.init) {
			this.init.include(context, includeChildrenRecursively);
		}
	}

	includeAllDeclaredVariables(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		this.id.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		const renderId = this.id.included;
		if (renderId) {
			this.id.render(code, options);
		} else {
			const operatorPos = findFirstOccurrenceOutsideComment(code.original, '=', this.id.end);
			code.remove(this.start, findNonWhiteSpace(code.original, operatorPos + 1));
		}
		if (this.init) {
			this.init.render(
				code,
				options,
				renderId ? BLANK : { renderedParentType: NodeType.ExpressionStatement }
			);
		}
	}
}
