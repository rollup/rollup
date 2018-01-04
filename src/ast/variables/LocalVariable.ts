import Variable from './Variable';
import VariableReassignmentTracker, { ObjectPath } from './VariableReassignmentTracker';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import Identifier from '../nodes/Identifier';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import { Expression, ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from '../nodes/shared/Expression';

// To avoid infinite recursions
const MAX_PATH_DEPTH = 7;

export default class LocalVariable extends Variable {
	declarations: Set<Identifier | ExportDefaultDeclaration>;
	boundExpressions: VariableReassignmentTracker;

	constructor (
		name: string, declarator: Identifier | ExportDefaultDeclaration | null,
		init: Expression
	) {
		super(name);
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set(declarator ? [declarator] : null);
		this.boundExpressions = new VariableReassignmentTracker(init);
	}

	addDeclaration (identifier: Identifier) {
		this.declarations.add(identifier);
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (path.length > MAX_PATH_DEPTH) return;
		this.boundExpressions.forEachAtPath(
			path,
			(relativePath, node) =>
				!options.hasNodeBeenCalledAtPathWithOptions(
					relativePath, node, callOptions
				) &&
				node.forEachReturnExpressionWhenCalledAtPath(
					relativePath,
					callOptions,
					callback,
					options.addCalledNodeAtPathWithOptions(
						relativePath, node, callOptions
					)
				)
		);
	}

	getName (es: boolean) {
		if (es) return this.name;
		if (!this.isReassigned || !this.exportName) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > MAX_PATH_DEPTH ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath, node) =>
					relativePath.length > 0 &&
					!options.hasNodeBeenAccessedAtPath(relativePath, node) &&
					node.hasEffectsWhenAccessedAtPath(
						relativePath,
						options.addAccessedNodeAtPath(relativePath, node)
					)
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			this.included ||
			path.length > MAX_PATH_DEPTH ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath, node) =>
					relativePath.length > 0 &&
					!options.hasNodeBeenAssignedAtPath(relativePath, node) &&
					node.hasEffectsWhenAssignedAtPath(
						relativePath,
						options.addAssignedNodeAtPath(relativePath, node)
					)
			)
		);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			path.length > MAX_PATH_DEPTH ||
			(this.included && path.length > 0) ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath, node) =>
					!options.hasNodeBeenCalledAtPathWithOptions(
						relativePath, node, callOptions
					) &&
					node.hasEffectsWhenCalledAtPath(
						relativePath,
						callOptions,
						options.addCalledNodeAtPathWithOptions(
							relativePath, node, callOptions
						)
					)
			)
		);
	}

	includeVariable () {
		if (!super.includeVariable()) return false;
		this.declarations.forEach(identifier => identifier.includeInBundle());
		return true;
	}

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > MAX_PATH_DEPTH) return;
		if (path.length === 0) {
			this.isReassigned = true;
		}
		if (!options.hasNodeBeenAssignedAtPath(path, this)) {
			this.boundExpressions.reassignPath(
				path,
				options.addAssignedNodeAtPath(path, this)
			);
		}
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return (
			path.length > MAX_PATH_DEPTH ||
			(this.included && path.length > 0) ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath, node) =>
					!options.hasNodeBeenCalledAtPathWithOptions(
						relativePath, node, callOptions
					) &&
					node.someReturnExpressionWhenCalledAtPath(
						relativePath,
						callOptions,
						predicateFunction,
						options.addCalledNodeAtPathWithOptions(
							relativePath, node, callOptions
						)
					)
			)
		);
	}
}
