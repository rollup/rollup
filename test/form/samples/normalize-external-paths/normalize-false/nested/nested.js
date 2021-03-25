import { relativeUnresolved } from '../relativeUnresolved.js';
import { absolute } from '/absolute.js';
import { pluginDirect } from '../pluginDirect.js';
import { pluginTrue } from '../pluginTrue.js';
import { pluginAbsolute } from '../pluginAbsolute.js';
import { pluginNormalize } from '../pluginNormalize.js';

console.log(
	'nested',
	relativeUnresolved,
	relativeMissing,
	relativeExisting,
	absolute,
	pluginDirect,
	pluginTrue,
	pluginAbsolute,
	pluginNormalize
);
