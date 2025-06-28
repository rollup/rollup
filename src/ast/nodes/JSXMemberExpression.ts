import type { ast } from '../../rollup/types';
import type { InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import type JSXIdentifier from './JSXIdentifier';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXMemberExpression extends NodeBase<ast.JSXMemberExpression> {
	type!: NodeType.tJSXMemberExpression;
	object!: nodes.JSXTagNameExpression;
	property!: JSXIdentifier;

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		this.object.includePath([this.property.name], context);
	}

	includePath(path: ObjectPath, context: InclusionContext) {
		if (!this.included) this.includeNode(context);
		this.object.includePath([this.property.name, ...path], context);
	}
}
