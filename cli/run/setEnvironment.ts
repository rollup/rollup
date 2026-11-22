import { env } from 'node:process';

export function setEnvironment(environment: string | string[] | undefined): void {
	if (environment) {
		for (const argument of Array.isArray(environment) ? environment : [environment]) {
			for (const pair of argument.split(',')) {
				const [key, ...value] = pair.split(':');
				env[key] = value.length === 0 ? String(true) : value.join(':');
			}
		}
	}
}
