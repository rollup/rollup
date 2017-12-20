import Variable from './Variable';
import VariableReassignmentTracker from './VariableReassignmentTracker';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { PredicateFunction } from '../values';
import CallOptions from '../CallOptions';

// To avoid infinite recursions
const MAX_PATH_DEPTH = 7;

export default class LocalVariable extends Variable {
	constructor (name, declarator, init) {
		super(name);
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set(declarator ? [declarator] : null);
		this.boundExpressions = new VariableReassignmentTracker(init);
	}

	addDeclaration (identifier) {
		this.declarations.add(identifier);
	}

	reassignPath (path: string[], options: ExecutionPathOptions) {
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

	forEachReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		callback: (options: ExecutionPathOptions) => (node: Node) => void,
		options: ExecutionPathOptions
	) {
		if (path.length > MAX_PATH_DEPTH) return;
		this.boundExpressions.forEachAtPath(
			path,
			(relativePath, node) =>
				!options.hasNodeBeenCalledAtPathWithOptions(
					relativePath,
					node,
					callOptions
				) &&
				node.forEachReturnExpressionWhenCalledAtPath(
					relativePath,
					callOptions,
					callback,
					options.addCalledNodeAtPathWithOptions(
						relativePath,
						node,
						callOptions
					)
				)
		);
	}

	getName (es: boolean) {
		if (es) return this.name;
		if (!this.isReassigned || !this.exportName) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAccessedAtPath (path, options) {
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

	hasEffectsWhenAssignedAtPath (path, options) {
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

	hasEffectsWhenCalledAtPath (path, callOptions, options) {
		return (
			path.length > MAX_PATH_DEPTH ||
			(this.included && path.length > 0) ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath, node) =>
					!options.hasNodeBeenCalledAtPathWithOptions(
						relativePath,
						node,
						callOptions
					) &&
					node.hasEffectsWhenCalledAtPath(
						relativePath,
						callOptions,
						options.addCalledNodeAtPathWithOptions(
							relativePath,
							node,
							callOptions
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

	someReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
	) {
		return (
			path.length > MAX_PATH_DEPTH ||
			(this.included && path.length > 0) ||
			this.boundExpressions.someAtPath(
				path,
				(relativePath: string[], node) =>
					!options.hasNodeBeenCalledAtPathWithOptions(
						relativePath,
						node,
						callOptions
					) &&
					node.someReturnExpressionWhenCalledAtPath(
						relativePath,
						callOptions,
						predicateFunction,
						options.addCalledNodeAtPathWithOptions(
							relativePath,
							node,
							callOptions
						)
					)
			)
		);
	}

	toString () {
		return this.name;
	}
}
