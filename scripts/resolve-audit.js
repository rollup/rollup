import { spawn } from 'node:child_process';
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
const originalAuditResolve = /** @type {AuditResolve} */ (JSON.parse(originalContent));

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
 * @param {Record<string, Decision>} originalDecisions
 * @param {Record<string, Decision>} updatedDecisions
 * @return {Record<string, Decision>}
 */
function mergeDecisions(originalDecisions, updatedDecisions) {
	return Object.fromEntries(
		Object.keys(updatedDecisions)
			.sort()
			.map(key => {
				const originalDecision = originalDecisions[key];
				const updatedDecision = updatedDecisions[key];
				if (
					originalDecision?.decision === updatedDecision.decision &&
					isStillInForce(originalDecision)
				) {
					return [
						key,
						{
							...updatedDecision,
							expiresAt: originalDecision.expiresAt,
							madeAt: originalDecision.madeAt
						}
					];
				}
				return [key, updatedDecision];
			})
	);
}

writeAuditResolve({ ...originalAuditResolve, decisions: {} });

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

const updatedAuditResolve = /** @type {AuditResolve} */ (
	JSON.parse(readFileSync(auditResolveFile, 'utf8'))
);
const mergedDecisions = mergeDecisions(
	originalAuditResolve.decisions,
	updatedAuditResolve.decisions
);

writeAuditResolve({ ...updatedAuditResolve, decisions: mergedDecisions });

const prunedCount = Object.keys(originalAuditResolve.decisions).filter(
	key => !Object.hasOwn(mergedDecisions, key)
).length;
console.log(`Wrote ${Object.keys(mergedDecisions).length} decisions and pruned ${prunedCount}.`);
