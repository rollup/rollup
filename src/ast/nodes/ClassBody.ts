import ClassBodyScope from '../scopes/ClassBodyScope';
import Scope from '../scopes/Scope';
import MethodDefinition from './MethodDefinition';
import * as NodeType from './NodeType';
import PropertyDefinition from './PropertyDefinition';
import { NodeBase } from './shared/Node';

export default class ClassBody extends NodeBase {
	body!: (MethodDefinition | PropertyDefinition)[];
	type!: NodeType.tClassBody;

	createScope(parentScope: Scope) {
		this.scope = new ClassBodyScope(parentScope);
	}
}
