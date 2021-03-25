import { relativeUnresolved } from './relativeUnresolved.js';
import { absolute } from '/absolute.js';
import { pluginDirect } from './pluginDirect.js';
import { pluginTrue } from './pluginTrue.js';
import { pluginAbsolute } from './pluginAbsolute.js';
import { pluginNormalize } from './pluginNormalize.js';
import './nested/nested.js';

console.log(
	'main',
	relativeUnresolved,
	relativeMissing,
	relativeExisting,
	absolute,
	pluginDirect,
	pluginTrue,
	pluginAbsolute,
	pluginNormalize
);
