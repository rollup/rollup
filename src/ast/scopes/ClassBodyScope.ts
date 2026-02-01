import type ClassNode from '../nodes/shared/ClassNode';
import { EMPTY_PATH } from '../utils/PathTracker';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import ChildScope from './ChildScope';

export default class ClassBodyScope extends ChildScope {
	readonly instanceScope: ChildScope;
	readonly thisVariable: LocalVariable;

	constructor(parent: ChildScope, classNode: ClassNode) {
		const { context } = parent;
		super(parent, context);
		this.variables.set(
			'this',
			(this.thisVariable = new LocalVariable('this', null, classNode, EMPTY_PATH, context, 'other'))
		);
		this.instanceScope = new ChildScope(this, context);
		this.instanceScope.variables.set('this', new ThisVariable(context));
	}

	findLexicalBoundary(): ChildScope {
		return this;
	}
}
