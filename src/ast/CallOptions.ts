import type SpreadElement from './nodes/SpreadElement';
import type { ExpressionEntity } from './nodes/shared/Expression';

export interface CallOptions {
	args: (ExpressionEntity | SpreadElement)[];
	thisArg: ExpressionEntity | null;
	withNew: boolean;
}
