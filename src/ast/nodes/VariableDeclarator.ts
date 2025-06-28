import type MagicString from 'magic-string';
import type { ast, NormalizedTreeshakingOptions } from '../../rollup/types';
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
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	type NodeInteractionAccessed,
	type NodeInteractionCalled
} from '../NodeInteractions';
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
import type * as nodes from './node-unions';
import * as NodeType from './NodeType';
import type FunctionBase from './shared/FunctionBase';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase
} from './shared/Node';
import type { VariableKind } from './shared/VariableKinds';

export default class VariableDeclarator extends NodeBase<ast.VariableDeclarator> {
	declare parent: nodes.VariableDeclaratorParent;
	declare id: nodes.BindingPattern;
	declare init: nodes.Expression | null;
	declare type: NodeType.tVariableDeclarator;
	declare isUsingDeclaration: boolean;
	declare isAsyncUsingDeclaration: boolean;
	declare private disposalCall?: NodeInteractionCalled;
	declare private disposalFunction?: FunctionBase;
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
		const { disposalCall, disposalFunction } = this;
		// Before including init so that newly included receiver paths are included in this pass
		if (disposalFunction && disposalCall) {
			disposalFunction.includeCallArgumentsWhenCalledAtPath(EMPTY_PATH, disposalCall, context);
		}
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
			if (this.isUsingDeclaration || this.isAsyncUsingDeclaration) {
				const disposalInteractions: DisposalInteractions = {
					access: { args: [init], type: INTERACTION_ACCESSED },
					call: { args: [init], type: INTERACTION_CALLED, withNew: false }
				};
				if (
					this.isUsingDeclaration ||
					!this.includeDisposalMethodAndCheckIfKnownFunction(
						init,
						SYMBOL_ASYNC_DISPOSE_PATH,
						disposalInteractions,
						context
					)
				) {
					this.includeDisposalMethodAndCheckIfKnownFunction(
						init,
						SYMBOL_DISPOSE_PATH,
						disposalInteractions,
						context
					);
				}
				this.scope.context.requestTreeshakingPass();
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

	private includeDisposalMethodAndCheckIfKnownFunction(
		init: ExpressionNode,
		path: ObjectPath,
		{ access, call }: DisposalInteractions,
		context: InclusionContext
	): boolean {
		init.deoptimizeArgumentsOnInteractionAtPath(access, path, SHARED_RECURSION_TRACKER);
		const disposalFunction = init.getKnownFunctionAtPath(path, SHARED_RECURSION_TRACKER, this);
		init.includePath(path, context);
		if (!disposalFunction) {
			const disposalValue = init.getLiteralValueAtPath(path, SHARED_RECURSION_TRACKER, this);
			if (disposalValue !== null && disposalValue !== undefined) {
				init.deoptimizeArgumentsOnInteractionAtPath(call, path, SHARED_RECURSION_TRACKER);
				init.includeCallArgumentsWhenCalledAtPath(path, call, context);
			}
			return false;
		}
		this.disposalFunction = disposalFunction;
		this.disposalCall = call;
		disposalFunction.deoptimizeArgumentsOnInteractionAtPath(
			call,
			EMPTY_PATH,
			SHARED_RECURSION_TRACKER
		);
		return true;
	}
}

VariableDeclarator.prototype.applyDeoptimizations = doNotDeoptimize;

interface DisposalInteractions {
	access: NodeInteractionAccessed;
	call: NodeInteractionCalled;
}

const SYMBOL_DISPOSE_PATH: ObjectPath = [SymbolDispose];
const SYMBOL_ASYNC_DISPOSE_PATH: ObjectPath = [SymbolAsyncDispose];
