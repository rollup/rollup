import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import { isReassignedExportsMember } from '../../utils/reassignedExportsMember';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type RenderOptions
} from '../../utils/renderHelpers';
import {
	createInclusionContext,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import { INTERACTION_CALLED, type NodeInteractionCalled } from '../NodeInteractions';
import FunctionScope from '../scopes/FunctionScope';
import {
	EMPTY_PATH,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	SymbolAsyncDispose,
	SymbolDispose,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import ClassExpression from './ClassExpression';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import type FunctionBase from './shared/FunctionBase';
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
	declare isAsyncUsingDeclaration: boolean;
	declare private disposalFunctions?: Set<FunctionBase>;
	declare private hasDeoptimizedDisposal: boolean;

	declareDeclarator(kind: VariableKind): void {
		this.isUsingDeclaration = kind === 'using';
		this.isAsyncUsingDeclaration = kind === 'await using';
		this.id.declare(kind, EMPTY_PATH, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath): void {
		this.id.deoptimizePath(path);
	}

	deoptimizeCache(): void {
		if (!this.hasDeoptimizedDisposal && this.init) {
			this.hasDeoptimizedDisposal = true;
			this.init.deoptimizePath(UNKNOWN_PATH);
			this.init.includePath(UNKNOWN_PATH, createInclusionContext());
			this.scope.context.requestTreeshakingPass();
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		const initEffect = this.init?.hasEffects(context);
		this.id.markDeclarationReached();
		return (
			initEffect ||
			this.isUsingDeclaration ||
			this.isAsyncUsingDeclaration ||
			this.id.hasEffects(context) ||
			((this.scope.context.options.treeshake as NormalizedTreeshakingOptions)
				.propertyReadSideEffects &&
				this.id.hasEffectsWhenDestructuring(context, EMPTY_PATH, this.init || UNDEFINED_EXPRESSION))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		const { id, init } = this;
		if (!this.included) this.includeNode(context);
		init?.include(context, includeChildrenRecursively);
		if (this.disposalFunctions && init) {
			for (const disposalFunction of this.disposalFunctions) {
				if (
					disposalFunction.scope instanceof FunctionScope &&
					disposalFunction.scope.thisVariable.included
				) {
					init.includePath(UNKNOWN_PATH, context);
					break;
				}
			}
		}
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
		const renderId = id.included || this.isUsingDeclaration || this.isAsyncUsingDeclaration;
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

	includeNode(context: InclusionContext): void {
		this.included = true;
		const { id, init } = this;
		if (init) {
			if (
				this.isUsingDeclaration ||
				(this.isAsyncUsingDeclaration &&
					!this.includeDisposalMethod(init, SYMBOL_ASYNC_DISPOSE_PATH, context))
			) {
				this.includeDisposalMethod(init, SYMBOL_DISPOSE_PATH, context);
			}
			if (id instanceof Identifier && init instanceof ClassExpression && !init.id) {
				const { name, variable } = id;
				for (const accessedVariable of init.scope.accessedOutsideVariables.values()) {
					if (accessedVariable !== variable) {
						accessedVariable.forbidName(name);
					}
				}
			}
		}
	}

	private includeDisposalMethod(
		init: ExpressionNode,
		path: ObjectPath,
		context: InclusionContext
	): boolean {
		const disposalFunction = init.getKnownFunctionAtPath(path, SHARED_RECURSION_TRACKER, this);
		init.includePath(path, context);
		if (!disposalFunction) {
			const disposalValue = init.getLiteralValueAtPath(path, SHARED_RECURSION_TRACKER, this);
			if (disposalValue !== null && disposalValue !== undefined) {
				const interaction: NodeInteractionCalled = {
					args: [init],
					type: INTERACTION_CALLED,
					withNew: false
				};
				init.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
				init.includeCallArgumentsWhenCalledAtPath(path, interaction, context);
			}
			return false;
		}
		const disposalFunctions = (this.disposalFunctions ||= new Set<FunctionBase>());
		if (!disposalFunctions.has(disposalFunction)) {
			disposalFunctions.add(disposalFunction);
			disposalFunction.deoptimizeArgumentsOnInteractionAtPath(
				{ args: [init], type: INTERACTION_CALLED, withNew: false },
				EMPTY_PATH,
				SHARED_RECURSION_TRACKER
			);
		}
		return true;
	}
}

VariableDeclarator.prototype.applyDeoptimizations = doNotDeoptimize;

const SYMBOL_DISPOSE_PATH: ObjectPath = [SymbolDispose];
const SYMBOL_ASYNC_DISPOSE_PATH: ObjectPath = [SymbolAsyncDispose];
