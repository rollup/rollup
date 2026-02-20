import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import JSXClosingBase from './shared/JSXClosingBase';

export default class JSXClosingFragment extends JSXClosingBase {
	declare parent: nodes.JSXClosingFragmentParent;
	declare type: NodeType.tJSXClosingFragment;
}
