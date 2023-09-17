#!/usr/bin/env node

import { env, exit } from 'node:process';

if (env.ROLLUP_RELEASE !== 'releasing') {
	console.error('This script should only be run as part of the release process.');
	exit(1);
}
