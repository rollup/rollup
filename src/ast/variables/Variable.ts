import { ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../values';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from '../nodes/Identifier';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from '../nodes/shared/Expression';

export default class Variable implements ExpressionEntity {
	exportName?: string;
	included: boolean;
	isExternal?: boolean;
	isGlobal?: boolean;
	isDefault?: boolean;
	isNamespace?: boolean;
	isReassigned: boolean;
	isId: boolean;
	name: string;
	reexported?: boolean;
	safeName: string;

	constructor(name: string) {
		this.name = name;
		this.safeName = null;
	}

	/**
	 * Binds identifiers that reference this variable to this variable.
	 * Necessary to be able to change variable names.
	 */
	addReference(_identifier: Identifier) {}

	reassignPath(_path: ObjectPath, _options: ExecutionPathOptions) {}

	forEachReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_callback: ForEachReturnExpressionCallback,
		_options: ExecutionPathOptions
	) {}

	getName(reset?: boolean): string {
		if (
			reset &&
			this.safeName &&
			this.safeName !== this.name &&
			this.safeName[this.name.length] === '$' &&
			this.safeName[this.name.length + 1] === '$'
		) {
			this.safeName = undefined;
			return this.name;
		}
		return this.safeName || this.name;
	}

	getValue() {
		return UNKNOWN_VALUE;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	hasEffectsWhenCalledAtPath(_path: ObjectPath, _callOptions: CallOptions, _options: ExecutionPathOptions) {
		return true;
	}

	/**
	 * Marks this variable as being part of the bundle, which is usually the case when one of
	 * its identifiers becomes part of the bundle. Returns true if it has not been included
	 * previously.
	 * Once a variable is included, it should take care all its declarations are included.
	 */
	includeVariable() {
		if (this.included) {
			return false;
		}
		this.included = true;
		return true;
	}

	someReturnExpressionWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		return predicateFunction(options)(UNKNOWN_EXPRESSION);
	}

	toString() {
		return this.name;
	}

	setSafeName(name: string) {
		this.safeName = name;
	}
}
