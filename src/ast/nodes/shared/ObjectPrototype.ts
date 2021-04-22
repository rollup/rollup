import {
	METHOD_RETURNS_BOOLEAN,
	METHOD_RETURNS_STRING,
	METHOD_RETURNS_UNKNOWN
} from './MethodTypes';
import { ObjectEntity } from './ObjectEntity';

export const OBJECT_PROTOTYPE = new ObjectEntity(
	[
		{ key: 'hasOwnProperty', kind: 'init', property: METHOD_RETURNS_BOOLEAN },
		{ key: 'isPrototypeOf', kind: 'init', property: METHOD_RETURNS_BOOLEAN },
		{ key: 'propertyIsEnumerable', kind: 'init', property: METHOD_RETURNS_BOOLEAN },
		{ key: 'toLocaleString', kind: 'init', property: METHOD_RETURNS_STRING },
		{ key: 'toString', kind: 'init', property: METHOD_RETURNS_STRING },
		{ key: 'valueOf', kind: 'init', property: METHOD_RETURNS_UNKNOWN }
	],
	null
);
