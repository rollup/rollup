import type ExternalModule from '../../ExternalModule';
import type Module from '../../Module';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import type Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import type { ObjectPath } from '../utils/PathTracker';

export default class Variable extends ExpressionEntity {
	alwaysRendered = false;
	forbiddenNames: Set<string> | null = null;
	initReached = false;
	isId = false;
	// both NamespaceVariable and ExternalVariable can be namespaces
	declare isNamespace?: boolean;
	isReassigned = false;
	kind: VariableKind | null = null;
	declare module?: Module | ExternalModule;
	renderBaseName: string | null = null;
	renderName: string | null = null;

	private renderedLikeHoisted?: Variable;

	constructor(public name: string) {
		super();
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 */
	addReference(_identifier: Identifier): void {}

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
	 * Marks this variable as being part of the bundle, which is usually the case when one of
	 * its identifiers becomes part of the bundle. Returns true if it has not been included
	 * previously.
	 * Once a variable is included, it should take care all its declarations are included.
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
