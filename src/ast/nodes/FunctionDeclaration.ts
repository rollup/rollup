import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { Node } from './shared/Node';

export function isFunctionDeclaration (node: Node): node is FunctionDeclaration {
	return node.type === NodeType.FunctionDeclaration;
}

export default class FunctionDeclaration extends FunctionNode {
	type: NodeType.FunctionDeclaration;

	initialiseChildren (parentScope: Scope) {
		this.id && this.id.initialiseAndDeclare(parentScope, 'function', this);
		this.params.forEach(param =>
			param.initialiseAndDeclare(this.scope, 'parameter', null)
		);
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
	}

	render (code: MagicString, options: RenderOptions) {
		if (!this.module.graph.treeshake || this.included) {
			super.render(code, options);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
