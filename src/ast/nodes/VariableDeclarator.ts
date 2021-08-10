import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { isReassignedExportsMember } from '../../utils/reassignedExportsMember';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	RenderOptions
} from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { ObjectPath } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class VariableDeclarator extends NodeBase {
	id!: PatternNode;
	init!: ExpressionNode | null;
	type!: NodeType.tVariableDeclarator;

	declareDeclarator(kind: string): void {
		this.id.declare(kind, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		this.id.deoptimizePath(path);
	}

	hasEffects(context: HasEffectsContext): boolean {
		const initEffect = this.init !== null && this.init.hasEffects(context);
		this.id.markDeclarationReached();
		return initEffect || this.id.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		if (this.init) {
			this.init.include(context, includeChildrenRecursively);
		}
		this.id.markDeclarationReached();
		if (includeChildrenRecursively || this.id.shouldBeIncluded(context)) {
			this.id.include(context, includeChildrenRecursively);
		}
	}

	render(code: MagicString, options: RenderOptions): void {
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
				renderId ? BLANK : { renderedSurroundingElement: NodeType.ExpressionStatement }
			);
		} else if (
			this.id instanceof Identifier &&
			isReassignedExportsMember(this.id.variable!, options.exportNamesByVariable)
		) {
			const _ = options.compact ? '' : ' ';
			code.appendLeft(this.end, `${_}=${_}void 0`);
		}
	}
}
