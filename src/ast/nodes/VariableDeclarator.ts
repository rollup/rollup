import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
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
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase
} from './shared/Node';
import type { DeclarationPatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class VariableDeclarator extends NodeBase {
	declare id: DeclarationPatternNode;
	declare init: ExpressionNode | null;
	declare type: NodeType.tVariableDeclarator;
	declare isUsingDeclaration: boolean;

	declareDeclarator(kind: VariableKind, isUsingDeclaration: boolean): void {
		this.isUsingDeclaration = isUsingDeclaration;
		this.id.declare(kind, EMPTY_PATH, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		this.id.deoptimizePath(path);
	}

	hasEffects(context: HasEffectsContext): boolean {
		const initEffect = this.init?.hasEffects(context);
		this.id.markDeclarationReached();
		return (
			initEffect ||
			this.isUsingDeclaration ||
			this.id.hasEffects(context) ||
			((this.scope.context.options.treeshake as NormalizedTreeshakingOptions)
				.propertyReadSideEffects &&
				this.id.hasEffectsWhenDestructuring(context, EMPTY_PATH, this.init || UNDEFINED_EXPRESSION))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		const { id, init } = this;
		if (!this.included) this.includeNode();
		init?.include(context, includeChildrenRecursively);
		id.markDeclarationReached();
		if (includeChildrenRecursively) {
			id.include(context, includeChildrenRecursively);
		} else {
			id.includeDestructuredIfNecessary(context, EMPTY_PATH, init || UNDEFINED_EXPRESSION);
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

	includeNode() {
		this.included = true;
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

VariableDeclarator.prototype.applyDeoptimizations = doNotDeoptimize;
