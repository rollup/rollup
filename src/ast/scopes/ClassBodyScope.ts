import type { AstContext } from '../../Module';
import type ClassNode from '../nodes/shared/ClassNode';
import { VariableKind } from '../nodes/shared/VariableKinds';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import ChildScope from './ChildScope';
import type Scope from './Scope';

export default class ClassBodyScope extends ChildScope {
	readonly instanceScope: ChildScope;
	readonly thisVariable: LocalVariable;

	constructor(parent: Scope, classNode: ClassNode, context: AstContext) {
		super(parent, context);
		this.variables.set(
			'this',
			(this.thisVariable = new LocalVariable('this', null, classNode, context, VariableKind.other))
		);
		this.instanceScope = new ChildScope(this, context);
		this.instanceScope.variables.set('this', new ThisVariable(context));
	}

	findLexicalBoundary(): ChildScope {
		return this;
	}
}
