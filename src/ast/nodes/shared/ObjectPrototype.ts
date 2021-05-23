import {
	METHOD_RETURNS_BOOLEAN,
	METHOD_RETURNS_STRING,
	METHOD_RETURNS_UNKNOWN
} from './MethodTypes';
import { ObjectEntity } from './ObjectEntity';

export const OBJECT_PROTOTYPE = new ObjectEntity(
	{
		hasOwnProperty: METHOD_RETURNS_BOOLEAN,
		isPrototypeOf: METHOD_RETURNS_BOOLEAN,
		propertyIsEnumerable: METHOD_RETURNS_BOOLEAN,
		toLocaleString: METHOD_RETURNS_STRING,
		toString: METHOD_RETURNS_STRING,
		valueOf: METHOD_RETURNS_UNKNOWN
	},
	null
);
