import type { InclusionContext } from '../ExecutionContext';
import type ChildScope from '../scopes/ChildScope';
import ClassBodyScope from '../scopes/ClassBodyScope';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type MethodDefinition from './MethodDefinition';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import type PropertyDefinition from './PropertyDefinition';
import {
	doNotDeoptimize,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';
import type StaticBlock from './StaticBlock';

export default class ClassBody extends NodeBase {
	declare parent: nodes.ClassBodyParent;
	declare body: (MethodDefinition | PropertyDefinition | StaticBlock)[];
	declare scope: ClassBodyScope;
	declare type: NodeType.tClassBody;

	createScope(parentScope: ChildScope): void {
		this.scope = new ClassBodyScope(parentScope, this.parent);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.scope.context.includeVariableInModule(this.scope.thisVariable, UNKNOWN_PATH, context);
		for (const definition of this.body) {
			definition.include(context, includeChildrenRecursively);
		}
	}
}

ClassBody.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ClassBody.prototype.applyDeoptimizations = doNotDeoptimize;
