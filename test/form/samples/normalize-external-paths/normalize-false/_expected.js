import { relativeUnresolved as relativeUnresolved$1 } from './relativeUnresolved.js';
import { absolute } from '/absolute.js';
import { pluginDirect as pluginDirect$1 } from './pluginDirect.js';
import { pluginTrue } from '/pluginTrue.js';
import { pluginAbsolute } from '/pluginAbsolute.js';
import { pluginNormalize } from './pluginNormalize.js';
import { relativeUnresolved } from '../relativeUnresolved.js';
import { pluginDirect } from '../pluginDirect.js';

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

console.log(
	'main',
	relativeUnresolved$1,
	relativeMissing,
	relativeExisting,
	absolute,
	pluginDirect$1,
	pluginTrue,
	pluginAbsolute,
	pluginNormalize
);
