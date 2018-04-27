import Variable from './Variable';
import VariableReassignmentTracker from './VariableReassignmentTracker';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import Identifier from '../nodes/Identifier';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from '../nodes/shared/Expression';
import { ObjectPath, LiteralValueOrUnknown, UNKNOWN_VALUE } from '../values';
import { Node } from '../nodes/shared/Node';
import * as NodeType from '../nodes/NodeType';

// To avoid infinite recursions
const MAX_PATH_DEPTH = 7;

export default class LocalVariable extends Variable {
	declarations: (Identifier | ExportDefaultDeclaration)[];
	reassignments: VariableReassignmentTracker;
	init: ExpressionEntity;

	constructor(
		name: string,
		declarator: Identifier | ExportDefaultDeclaration | null,
		init: ExpressionEntity
	) {
		super(name);
		this.declarations = declarator ? [declarator] : [];
		this.reassignments = new VariableReassignmentTracker(init);
		this.init = init;
	}

	addDeclaration(identifier: Identifier) {
		this.declarations.push(identifier);
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (
			this.init &&
			path.length <= MAX_PATH_DEPTH &&
			!options.hasNodeBeenCalledAtPathWithOptions(path, this.init, callOptions) &&
			!this.reassignments.isPathReassigned(path)
		) {
			this.init.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				options.addCalledNodeAtPathWithOptions(path, this.init, callOptions)
			);
		}
	}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (!this.init || this.reassignments.isPathReassigned(path)) {
			return UNKNOWN_VALUE;
		}
		return this.init.getLiteralValueAtPath(path);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) return false;
		return (
			path.length > MAX_PATH_DEPTH ||
			this.reassignments.isPathReassigned(path.slice(0, path.length - 1)) ||
			(this.init &&
				!options.hasNodeBeenAccessedAtPath(path, this.init) &&
				this.init.hasEffectsWhenAccessedAtPath(
					path,
					options.addAccessedNodeAtPath(path, this.init)
				))
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (this.included || path.length > MAX_PATH_DEPTH) return true;
		if (path.length === 0) return false;
		return (
			this.reassignments.isPathReassigned(path.slice(0, path.length - 1)) ||
			(this.init &&
				!options.hasNodeBeenAssignedAtPath(path, this.init) &&
				this.init.hasEffectsWhenAssignedAtPath(
					path,
					options.addAssignedNodeAtPath(path, this.init)
				))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (path.length > MAX_PATH_DEPTH || (this.included && path.length > 0)) return true;
		return (
			this.reassignments.isPathReassigned(path) ||
			(this.init &&
				!options.hasNodeBeenCalledAtPathWithOptions(path, this.init, callOptions) &&
				this.init.hasEffectsWhenCalledAtPath(
					path,
					callOptions,
					options.addCalledNodeAtPathWithOptions(path, this.init, callOptions)
				))
		);
	}

	include() {
		if (!this.included) {
			this.included = true;
			for (const declaration of this.declarations) {
				// If node is a default export, it can save a tree-shaking run to include the full declaration now
				if (!declaration.included) declaration.include();
				let node = <Node>declaration.parent;
				while (!node.included) {
					// We do not want to properly include parents in case they are part of a dead branch
					// in which case .include() might pull in more dead code
					node.included = true;
					if (node.type === NodeType.Program) break;
					node = <Node>node.parent;
				}
			}
		}
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > MAX_PATH_DEPTH) return;
		if (path.length === 0) {
			this.isReassigned = true;
		}
		if (!options.hasNodeBeenAssignedAtPath(path, this)) {
			this.reassignments.reassignPath(path, options.addAssignedNodeAtPath(path, this));
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (path.length > MAX_PATH_DEPTH || (this.included && path.length > 0)) return true;
		return (
			this.reassignments.isPathReassigned(path) ||
			(this.init &&
				!options.hasNodeBeenCalledAtPathWithOptions(path, this.init, callOptions) &&
				this.init.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options.addCalledNodeAtPathWithOptions(path, this.init, callOptions)
				))
		);
	}
}
