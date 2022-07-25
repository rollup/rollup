#!/usr/bin/env node

import { env, exit } from 'node:process';
import { red } from './colors.js';

if (env.ROLLUP_RELEASE !== 'releasing') {
	console.error(red`Do not call "npm publish" directly but rather run "scripts/release.js".`);
	exit(1);
}
