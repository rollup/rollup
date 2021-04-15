import { relativeUnresolved } from '../relativeUnresolved.js';
import { relativeMissing } from '../relativeMissing.js';
import { relativeExisting } from '../relativeExisting.js';
import { absolute } from '/absolute.js';
import { pluginDirect } from '../pluginDirect.js';
import { pluginDifferentAbsolute } from '/pluginDifferentAbsolute.js';
import { pluginTrue } from '../pluginTrue.js';
import { pluginForceAbsolute } from '../pluginForceAbsolute.js';
import { pluginForceRelative } from '../pluginForceRelative.js';

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
