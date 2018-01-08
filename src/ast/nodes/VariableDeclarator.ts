import { NodeBase } from './shared/Node';
import extractNames from '../utils/extractNames';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { PatternNode } from './shared/Pattern';
import { ExpressionNode } from './shared/Expression';

export default class VariableDeclarator extends NodeBase {
	type: 'VariableDeclarator';
	id: PatternNode;
	init: ExpressionNode | null;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		this.id.reassignPath(path, options);
	}

	initialiseDeclarator (parentScope: Scope, kind: string) {
		this.initialiseScope(parentScope);
		this.init && this.init.initialise(this.scope);
		this.id.initialiseAndDeclare(this.scope, kind, this.init);
	}

	// TODO Deleting this does not break any tests. Find meaningful test or delete.
	render (code: MagicString, es: boolean) {
		extractNames(this.id).forEach(name => {
			const variable = this.scope.findVariable(name);

			if (!es && variable.exportName && variable.isReassigned) {
				if (this.init) {
					code.overwrite(this.start, this.id.end, variable.getName(es));
				} else if (this.module.graph.treeshake) {
					code.remove(this.start, this.end);
				}
			}
		});

		super.render(code, es);
	}
}
