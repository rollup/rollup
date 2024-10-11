import type { ast } from '../../rollup/types';
import type * as NodeType from './NodeType';
import JSXClosingBase from './shared/JSXClosingBase';

export default class JSXClosingFragment extends JSXClosingBase<ast.JSXClosingFragment> {
	type!: NodeType.tJSXClosingFragment;
}
