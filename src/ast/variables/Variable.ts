import type ExternalModule from '../../ExternalModule';
import type Module from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import type { ObjectPath } from '../utils/PathTracker';

export default class Variable extends ExpressionEntity {
	alwaysRendered = false;
	initReached = false;
	isId = false;
	// both NamespaceVariable and ExternalVariable can be namespaces
	declare isNamespace?: boolean;
	isReassigned = false;
	kind: string | null = null;
	declare module?: Module | ExternalModule;
	renderBaseName: string | null = null;
	renderName: string | null = null;

	constructor(public name: string) {
		super();
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 */
	addReference(_identifier: Identifier): void {}

	getBaseVariableName(): string {
		return this.renderBaseName || this.renderName || this.name;
	}

	getName(getPropertyAccess: (name: string) => string): string {
		const name = this.renderName || this.name;
		return this.renderBaseName ? `${this.renderBaseName}${getPropertyAccess(name)}` : name;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _context: HasEffectsContext): boolean {
		return path.length > 0;
	}

	/**
	 * Marks this variable as being part of the bundle, which is usually the case when one of
	 * its identifiers becomes part of the bundle. Returns true if it has not been included
	 * previously.
	 * Once a variable is included, it should take care all its declarations are included.
	 */
	include(): void {
		this.included = true;
	}

	markCalledFromTryStatement(): void {}

	setRenderNames(baseName: string | null, name: string | null): void {
		this.renderBaseName = baseName;
		this.renderName = name;
	}
}
