#!/usr/bin/env node

import { env, exit } from 'node:process';

if (env.ROLLUP_RELEASE !== 'releasing') {
	console.error('Currently not in release mode.');
	exit(1);
}
