import { exec } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';
import { version } from '../package.json';

const execPromise = promisify(exec);

function generateBanner(commitHash: string): string {
	const date = new Date(
		env.SOURCE_DATE_EPOCH ? 1000 * +env.SOURCE_DATE_EPOCH : Date.now()
	).toUTCString();

	return `/*
  @license
	Rollup.js v${version}
	${date} - commit ${commitHash}

	https://github.com/rollup/rollup

	Released under the MIT License.
*/`;
}

let getBannerPromise: Promise<string> | null = null;

export default async function getBanner(): Promise<string> {
	return (getBannerPromise ||= execPromise('git rev-parse HEAD').then(({ stdout }) =>
		generateBanner(stdout.trim())
	));
}
