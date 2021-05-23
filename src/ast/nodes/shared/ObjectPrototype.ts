import {
	METHOD_RETURNS_BOOLEAN,
	METHOD_RETURNS_STRING,
	METHOD_RETURNS_UNKNOWN
} from './MethodTypes';
import { ObjectEntity } from './ObjectEntity';

export const OBJECT_PROTOTYPE = new ObjectEntity(
	{
		// @ts-ignore
		__proto__: null,
		// @ts-ignore
		hasOwnProperty: METHOD_RETURNS_BOOLEAN,
		// @ts-ignore
		isPrototypeOf: METHOD_RETURNS_BOOLEAN,
		// @ts-ignore
		propertyIsEnumerable: METHOD_RETURNS_BOOLEAN,
		// @ts-ignore
		toLocaleString: METHOD_RETURNS_STRING,
		// @ts-ignore
		toString: METHOD_RETURNS_STRING,
		// @ts-ignore
		valueOf: METHOD_RETURNS_UNKNOWN
	},
	null
);
