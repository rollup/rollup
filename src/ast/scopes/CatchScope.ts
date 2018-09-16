import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import LocalVariable from '../variables/LocalVariable';
import ParameterScope from './ParameterScope';

export default class CatchScope extends ParameterScope {
	addDeclaration(
		identifier: Identifier,
		deoptimizationTracker: EntityPathTracker,
		init: ExpressionEntity | null = null,
		isHoisted: boolean = false
	) {
		if (isHoisted) {
			return this.parent.addDeclaration(
				identifier,
				deoptimizationTracker,
				init,
				true
			) as LocalVariable;
		} else {
			return super.addDeclaration(identifier, deoptimizationTracker, init, false) as LocalVariable;
		}
	}
}
