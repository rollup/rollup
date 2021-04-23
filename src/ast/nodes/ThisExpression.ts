import MagicString from 'magic-string';
import { HasEffectsContext } from '../ExecutionContext';
import ModuleScope from '../scopes/ModuleScope';
import { ObjectPath } from '../utils/PathTracker';
import ThisVariable from '../variables/ThisVariable';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import FunctionNode from './shared/FunctionNode';
import { NodeBase } from './shared/Node';

export default class ThisExpression extends NodeBase {
	type!: NodeType.tThisExpression;

	variable!: ThisVariable;
	private alias!: string | null;
	private bound = false;

	bind() {
		if (this.bound) return;
		this.bound = true;
		this.variable = this.scope.findVariable('this') as ThisVariable;
	}

	deoptimizePath(path: ObjectPath) {
		this.bind();
		this.variable.deoptimizePath(path);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 && this.variable.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.variable.hasEffectsWhenAssignedAtPath(path, context);
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}

	initialise() {
		this.alias =
			this.scope.findLexicalBoundary() instanceof ModuleScope ? this.context.moduleContext : null;
		if (this.alias === 'undefined') {
			this.context.warn(
				{
					code: 'THIS_IS_UNDEFINED',
					message: `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
					url: `https://rollupjs.org/guide/en/#error-this-is-undefined`
				},
				this.start
			);
		}
		for (let parent = this.parent; parent instanceof NodeBase; parent = parent.parent) {
			if (parent instanceof ClassNode) {
				break;
			}
			if (parent instanceof FunctionNode) {
				parent.referencesThis = true;
				break;
			}
		}
	}

	render(code: MagicString) {
		if (this.alias !== null) {
			code.overwrite(this.start, this.end, this.alias, {
				contentOnly: false,
				storeName: true
			});
		}
	}
}
