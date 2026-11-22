import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, execPath, exit } from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {{decision: string, madeAt?: number, expiresAt?: number}} Decision
 * @typedef {{decisions: Record<string, Decision>}} AuditResolve
 */

const DAY = 24 * 60 * 60 * 1000;
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const auditResolveFile = `${projectRoot}/audit-resolve.json`;
const resolveAuditScript = `${projectRoot}/node_modules/npm-audit-resolver/resolve.js`;

const originalContent = readFileSync(auditResolveFile, 'utf8');
const originalDecisions = parseAuditResolve(originalContent).decisions;

/**
 * @param {string} content
 * @return {AuditResolve}
 */
function parseAuditResolve(content) {
	return JSON.parse(content);
}

/**
 * @param {AuditResolve} auditResolve
 */
function writeAuditResolve(auditResolve) {
	writeFileSync(auditResolveFile, `${JSON.stringify(auditResolve, null, 2)}\n`);
}

/**
 * @param {Decision} decision
 * @return {boolean}
 */
function isStillInForce(decision) {
	const now = Date.now();
	return (
		(decision.expiresAt === undefined || decision.expiresAt >= now) &&
		(decision.decision !== 'postpone' || (decision.madeAt ?? 0) + DAY >= now)
	);
}

/**
 * The advisories present in the audit report. npm reports them under varying
 * dependency paths, so only the advisory id is a reliable identifier.
 *
 * @return {Promise<Set<string> | undefined>}
 */
function readReportedAdvisoryIds() {
	const npmCli = process.env.npm_execpath;
	return new Promise(resolve => {
		execFile(
			npmCli ? execPath : 'npm',
			npmCli ? [npmCli, 'audit', '--json'] : ['audit', '--json'],
			{ cwd: projectRoot, maxBuffer: 64 * 1024 * 1024 },
			(error, stdout) => {
				let vulnerabilities;
				try {
					vulnerabilities = Object.values(JSON.parse(stdout).vulnerabilities ?? {});
				} catch {
					console.warn(
						`Could not read the audit report, keeping all unexpired decisions: ${error?.message ?? 'unparsable output'}`
					);
					resolve(undefined);
					return;
				}
				const reportedAdvisoryIds = new Set();
				for (const vulnerability of vulnerabilities) {
					for (const via of vulnerability.via) {
						if (typeof via === 'object') {
							reportedAdvisoryIds.add(String(via.source));
						}
					}
				}
				resolve(reportedAdvisoryIds);
			}
		);
	});
}

const childProcess = spawn(execPath, [resolveAuditScript, ...argv.slice(2)], {
	cwd: projectRoot,
	stdio: 'inherit'
});

/**
 * @param {NodeJS.Signals} signal
 */
const forwardSignal = signal => childProcess.kill(signal);
process.on('SIGINT', forwardSignal);
process.on('SIGTERM', forwardSignal);

const [status] = await once(childProcess, 'close');

if (status !== 0) {
	writeFileSync(auditResolveFile, originalContent);
	console.error('resolve-audit did not complete, restored audit-resolve.json.');
	exit(status ?? 1);
}

const updatedAuditResolve = parseAuditResolve(readFileSync(auditResolveFile, 'utf8'));
const reportedAdvisoryIds = await readReportedAdvisoryIds();
const decisions = Object.fromEntries(
	Object.keys(updatedAuditResolve.decisions)
		.filter(key => {
			const [advisoryId] = key.split('|');
			return (
				isStillInForce(updatedAuditResolve.decisions[key]) &&
				(reportedAdvisoryIds === undefined || reportedAdvisoryIds.has(advisoryId))
			);
		})
		.sort()
		.map(key => [key, updatedAuditResolve.decisions[key]])
);

writeAuditResolve({ ...updatedAuditResolve, decisions });

const prunedCount = Object.keys(originalDecisions).filter(
	key => !Object.hasOwn(decisions, key)
).length;
console.log(`Wrote ${Object.keys(decisions).length} decisions and pruned ${prunedCount}.`);
