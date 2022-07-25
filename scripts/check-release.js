#!/usr/bin/env node

import { env, exit } from 'node:process';

if (env.ROLLUP_RELEASE !== 'releasing') {
	exit(1);
}
