import ExternalModule from '../../ExternalModule';
import Module from '../../Module';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { ImmutableEntityPathTracker } from '../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';

export default class Variable implements ExpressionEntity {
	name: string;
	renderName: string | null = null;
	renderBaseName: string | null = null;
	isExternal?: boolean;
	isDefault?: boolean;
	isNamespace?: boolean;
	module: Module | ExternalModule | null;

	// Not initialised during construction
	exportName: string | null = null;
	safeExportName: string | null = null;
	included: boolean = false;
	isId: boolean = false;
	reexported: boolean = false;
	isReassigned: boolean = false;

	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 */
	addReference(_identifier: Identifier) {}

	getBaseVariableName(): string {
		return this.renderBaseName || this.renderName || this.name;
	}

	getName(): string {
		const name = this.renderName || this.name;
		return this.renderBaseName ? `${this.renderBaseName}.${name}` : name;
	}

	getLiteralValueAtPath(
		_path: ObjectPath,
		_recursionTracker: ImmutableEntityPathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return UNKNOWN_VALUE;
	}

	getReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_recursionTracker: ImmutableEntityPathTracker,
		_origin: DeoptimizableEntity
	): ExpressionEntity {
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	hasEffectsWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_options: ExecutionPathOptions
	) {
		return true;
	}

	/**
	 * Marks this variable as being part of the bundle, which is usually the case when one of
	 * its identifiers becomes part of the bundle. Returns true if it has not been included
	 * previously.
	 * Once a variable is included, it should take care all its declarations are included.
	 */
	include() {
		this.included = true;
	}

	deoptimizePath(_path: ObjectPath) {}

	setRenderNames(baseName: string | null, name: string | null) {
		this.renderBaseName = baseName;
		this.renderName = name;
	}

	setSafeName(name: string | null) {
		this.renderName = name;
	}

	toString() {
		return this.name;
	}
}
