import { relativeUnresolved as relativeUnresolved$1 } from './relativeUnresolved.js';
import { absolute } from '/absolute.js';
import { pluginDirect as pluginDirect$1 } from './pluginDirect.js';
import { pluginDifferentAbsolute } from '/pluginAbsolute.js';
import { pluginTrue } from '/pluginTrue.js';
import { pluginForceAbsolute } from '/pluginForceAbsolute.js';
import { pluginForceRelative } from './pluginForceRelative.js';
import { relativeUnresolved } from '../relativeUnresolved.js';
import { pluginDirect } from '../pluginDirect.js';

console.log(
	'nested',
	relativeUnresolved,
	relativeMissing,
	relativeExisting,
	absolute,
	pluginDirect,
	pluginDifferentAbsolute,
	pluginTrue,
	pluginForceAbsolute,
	pluginForceRelative
);

console.log(
	'main',
	relativeUnresolved$1,
	relativeMissing,
	relativeExisting,
	absolute,
	pluginDirect$1,
	pluginDifferentAbsolute,
	pluginTrue,
	pluginForceAbsolute,
	pluginForceRelative
);
