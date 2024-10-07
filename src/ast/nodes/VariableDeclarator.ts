import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { isReassignedExportsMember } from '../../utils/reassignedExportsMember';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type RenderOptions
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import ClassExpression from './ClassExpression';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { type ExpressionNode, type IncludeChildren, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class VariableDeclarator extends NodeBase {
	declare id: PatternNode;
	declare init: ExpressionNode | null;
	declare type: NodeType.tVariableDeclarator;
	declare isUsingDeclaration: boolean;

	declareDeclarator(kind: VariableKind, isUsingDeclaration: boolean): void {
		this.isUsingDeclaration = isUsingDeclaration;
		this.id.declare(kind, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		this.id.deoptimizePath(path);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const initEffect = this.init?.hasEffects(context);
		this.id.markDeclarationReached();
		return initEffect || this.id.hasEffects(context) || this.isUsingDeclaration;
	}

	includePath(
		_path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		const { deoptimized, id, init } = this;
		if (!deoptimized) this.applyDeoptimizations();
		this.included = true;
		init?.includePath(EMPTY_PATH, context, includeChildrenRecursively);
		id.markDeclarationReached();
		if (includeChildrenRecursively || id.shouldBeIncluded(context)) {
			id.includePath(EMPTY_PATH, context, includeChildrenRecursively);
		}
	}

	removeAnnotations(code: MagicString) {
		this.init?.removeAnnotations(code);
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			exportNamesByVariable,
			snippets: { _, getPropertyAccess }
		} = options;
		const { end, id, init, start } = this;
		const renderId = id.included || this.isUsingDeclaration;
		if (renderId) {
			id.render(code, options);
		} else {
			const operatorPos = findFirstOccurrenceOutsideComment(code.original, '=', id.end);
			code.remove(start, findNonWhiteSpace(code.original, operatorPos + 1));
		}
		if (init) {
			if (id instanceof Identifier && init instanceof ClassExpression && !init.id) {
				const renderedVariable = id.variable!.getName(getPropertyAccess);
				if (renderedVariable !== id.name) {
					code.appendLeft(init.start + 5, ` ${id.name}`);
				}
			}
			init.render(
				code,
				options,
				renderId ? BLANK : { renderedSurroundingElement: NodeType.ExpressionStatement }
			);
		} else if (
			id instanceof Identifier &&
			isReassignedExportsMember(id.variable!, exportNamesByVariable)
		) {
			code.appendLeft(end, `${_}=${_}void 0`);
		}
	}

	protected applyDeoptimizations() {
		this.deoptimized = true;
		const { id, init } = this;
		if (init && id instanceof Identifier && init instanceof ClassExpression && !init.id) {
			const { name, variable } = id;
			for (const accessedVariable of init.scope.accessedOutsideVariables.values()) {
				if (accessedVariable !== variable) {
					accessedVariable.forbidName(name);
				}
			}
		}
	}
}
