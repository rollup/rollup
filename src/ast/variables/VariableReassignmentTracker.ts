import { ObjectPath, UNKNOWN_KEY } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionEntity } from '../nodes/shared/Expression';

type PropertyReassignmentInfo = {
	properties: {
		[key: string]: PropertyReassignmentInfo;
	};
	isReassigned: boolean;
	hasUnknownReassignedProperty: boolean;
};

export default class VariableReassignmentTracker {
	private initialExpression: ExpressionEntity;
	private reassignedPaths: PropertyReassignmentInfo = {
		properties: Object.create(null),
		isReassigned: false,
		hasUnknownReassignedProperty: false
	};

	constructor(initialExpression: ExpressionEntity) {
		this.initialExpression = initialExpression;
	}

	isPathReassigned(path: ObjectPath): boolean {
		if (this.reassignedPaths.isReassigned) return true;
		let currentProperty = this.reassignedPaths;
		for (let keyIndex = 0; keyIndex < path.length; keyIndex++) {
			const key = path[keyIndex];
			if (currentProperty.hasUnknownReassignedProperty || key === UNKNOWN_KEY) return true;
			if (!currentProperty.properties[<string>key]) return false;
			currentProperty = currentProperty.properties[<string>key];
			if (currentProperty.isReassigned) return true;
		}
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) {
			this.initialExpression && this.initialExpression.reassignPath(path, options);
		}
		let currentProperty = this.reassignedPaths;
		for (let keyIndex = 0; keyIndex < path.length; keyIndex++) {
			if (currentProperty.isReassigned || currentProperty.hasUnknownReassignedProperty) return;
			const key = path[keyIndex];
			if (key === UNKNOWN_KEY) {
				currentProperty.hasUnknownReassignedProperty = true;
				return;
			}
			currentProperty =
				currentProperty.properties[<string>key] ||
				(currentProperty.properties[<string>key] = {
					properties: Object.create(null),
					isReassigned: false,
					hasUnknownReassignedProperty: false
				});
		}
		currentProperty.isReassigned = true;
	}
}
