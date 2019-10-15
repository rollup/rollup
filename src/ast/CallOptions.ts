import { ExpressionEntity } from './nodes/shared/Expression';
import SpreadElement from './nodes/SpreadElement';

export const NO_ARGS = [];

export interface CallOptions {
	args: (ExpressionEntity | SpreadElement)[];
	withNew: boolean;
}
