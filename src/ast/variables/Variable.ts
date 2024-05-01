import type ExternalModule from '../../ExternalModule';
import type Module from '../../Module';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import type CallExpression from '../nodes/CallExpression';
import * as NodeType from '../nodes/NodeType';
import { ExpressionEntity } from '../nodes/shared/Expression';
import type IdentifierBase from '../nodes/shared/IdentifierBase';
import type { NodeBase } from '../nodes/shared/Node';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import type { ObjectPath } from '../utils/PathTracker';

export default class Variable extends ExpressionEntity {
	alwaysRendered = false;
	forbiddenNames: Set<string> | null = null;
	globalName: string | null = null;
	initReached = false;
	isId = false;
	// both NamespaceVariable and ExternalVariable can be namespaces
	declare isNamespace?: boolean;
	kind: VariableKind | null = null;
	declare module?: Module | ExternalModule;
	renderBaseName: string | null = null;
	renderName: string | null = null;

	private renderedLikeHoisted?: Variable;

	readonly isReassigned = false;
	markReassigned() {
		(this as { isReassigned: boolean }).isReassigned = true;
	}

	constructor(public name: string) {
		super();
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 */
	addReference(_identifier: IdentifierBase): void {}

	private onlyFunctionCallUsed = true;
	/**
	 * Check if the identifier variable is only used as function call
	 * @returns true if the variable is only used as function call
	 */
	getOnlyFunctionCallUsed(): boolean {
		return this.onlyFunctionCallUsed;
	}

	/**
	 * Collect the places where the identifier variable is used
	 * @param usedPlace Where the variable is used
	 */
	addUsedPlace(usedPlace: NodeBase): void {
		const isFunctionCall =
			usedPlace.parent.type === NodeType.CallExpression &&
			(usedPlace.parent as CallExpression).callee === usedPlace;
		if (!isFunctionCall && usedPlace.parent.type !== NodeType.ExportDefaultDeclaration) {
			this.onlyFunctionCallUsed = false;
		}
	}

	/**
	 * Prevent this variable from being renamed to this name to avoid name
	 * collisions
	 */
	forbidName(name: string) {
		(this.forbiddenNames ||= new Set()).add(name);
	}

	getBaseVariableName(): string {
		return (
			this.renderedLikeHoisted?.getBaseVariableName() ||
			this.renderBaseName ||
			this.renderName ||
			this.name
		);
	}

	getName(
		getPropertyAccess: (name: string) => string,
		useOriginalName?: RenderOptions['useOriginalName']
	): string {
		if (this.globalName) {
			return this.globalName;
		}
		if (useOriginalName?.(this)) {
			return this.name;
		}
		if (this.renderedLikeHoisted) {
			return this.renderedLikeHoisted.getName(getPropertyAccess, useOriginalName);
		}
		const name = this.renderName || this.name;
		return this.renderBaseName ? `${this.renderBaseName}${getPropertyAccess(name)}` : name;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		{ type }: NodeInteraction,
		_context: HasEffectsContext
	): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 0;
	}

	/**
	 * Marks this variable as being part of the bundle, which is usually the case
	 * when one of its identifiers becomes part of the bundle. Returns true if it
	 * has not been included previously. Once a variable is included, it should
	 * take care all its declarations are included.
	 */
	include(): void {
		this.included = true;
		this.renderedLikeHoisted?.include();
	}

	/**
	 * Links the rendered name of this variable to another variable and includes
	 * this variable if the other variable is included.
	 */
	renderLikeHoisted(variable: Variable): void {
		this.renderedLikeHoisted = variable;
	}

	markCalledFromTryStatement(): void {}

	setRenderNames(baseName: string | null, name: string | null): void {
		this.renderBaseName = baseName;
		this.renderName = name;
	}
}
