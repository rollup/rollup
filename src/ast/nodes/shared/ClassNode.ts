import CallOptions from '../../CallOptions';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import { ObjectPath } from '../../values';
import ClassBody from '../ClassBody';
import Identifier from '../Identifier';
import { ExpressionNode, NodeBase } from './Node';

export default class ClassNode extends NodeBase {
	body!: ClassBody;
	id!: Identifier | null;
	superClass!: ExpressionNode | null;

	createScope(parentScope: Scope) {
		this.scope = new ChildScope(parentScope);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		return (
			this.body.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
			(this.superClass !== null &&
				this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, options))
		);
	}

	initialise() {
		if (this.id !== null) {
			this.id.declare('class', this);
		}
	}
}
