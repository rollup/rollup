import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	assertVersionWasIncreased,
	type BufferFormat,
	bufferFormatFile,
	getBufferFormat,
	getBufferFormatUpdate,
	readBufferFormat,
	writeBufferFormat
} from '../buffer-format.ts';
import { REPO_ROOT } from './fixtures.ts';

const unchangedFingerprint = 'unchanged-fingerprint';
const changedFingerprint = 'changed-fingerprint';

const createBufferFormat = (version: number, fingerprint: string): BufferFormat => ({
	fingerprint,
	version
});

const unchangedFormat = createBufferFormat(1000, unchangedFingerprint);

const createChangedLayout = (version: number): BufferFormat =>
	createBufferFormat(version, changedFingerprint);

const withTemporaryDirectory = async <Result>(
	run: (directory: string) => Promise<Result>
): Promise<Result> => {
	await mkdir(path.join(REPO_ROOT, 'tmp'), { recursive: true });
	const directory = await mkdtemp(path.join(REPO_ROOT, 'tmp', 'buffer-format-'));
	try {
		return await run(directory);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
};

const checkBufferFormatScript = path.join(REPO_ROOT, 'scripts', 'check-buffer-format.ts');

const runCheckBufferFormat = (previousFile?: string) =>
	spawnSync(
		process.execPath,
		previousFile ? [checkBufferFormatScript, previousFile] : [checkBufferFormatScript],
		{ encoding: 'utf8' }
	);

describe('buffer-format', () => {
	it('matches the committed scripts/buffer-format.json', async () => {
		assert.deepEqual(await readBufferFormat(), getBufferFormat());
	});

	it('writes tab-indented JSON with a trailing newline that can be read back', () =>
		withTemporaryDirectory(async directory => {
			const file = path.join(directory, 'buffer-format.json');
			const format = createBufferFormat(1001, changedFingerprint);
			await writeBufferFormat(format, file);
			assert.equal(
				await readFile(file, 'utf8'),
				'{\n\t"fingerprint": "changed-fingerprint",\n\t"version": 1001\n}\n'
			);
			assert.deepEqual(await readBufferFormat(file), format);
		}));

	it('reads a missing file as absent but rejects an unreadable one', () =>
		withTemporaryDirectory(async directory => {
			assert.equal(await readBufferFormat(path.join(directory, 'missing.json')), null);
			const unreadableFile = path.join(directory, 'unreadable.json');
			await writeFile(unreadableFile, 'not a buffer format');
			await assert.rejects(readBufferFormat(unreadableFile));
		}));

	it('has nothing to do when the recorded layout is up to date', () => {
		assert.equal(getBufferFormatUpdate(unchangedFormat, unchangedFormat), null);
		assert.doesNotThrow(() => assertVersionWasIncreased(unchangedFormat, unchangedFormat));
	});

	it('requires a new version and the committed file when the layout changed', () => {
		const changed = createChangedLayout(1000);
		const update = getBufferFormatUpdate(unchangedFormat, changed);
		assert.match(
			update?.failure ?? '',
			/layout changed and scripts\/buffer-format\.json has been updated\. Commit the file and increase BUFFER_FORMAT_VERSION/
		);
		assert.throws(
			() => assertVersionWasIncreased(unchangedFormat, changed),
			/layout changed but BUFFER_FORMAT_VERSION was not increased.*above 1000/
		);
	});

	it('accepts a layout change with an increased version', () => {
		const changed = createChangedLayout(1001);
		assert.doesNotThrow(() => assertVersionWasIncreased(unchangedFormat, changed));
		assert.match(getBufferFormatUpdate(unchangedFormat, changed)?.failure ?? '', /layout changed/);
	});

	it('rejects a layout change without an increased version', () => {
		assert.throws(
			() => assertVersionWasIncreased(unchangedFormat, createChangedLayout(1000)),
			/not increased/
		);
	});

	it('rewrites the file without failing when only the version changed', () => {
		const bumped = createBufferFormat(1001, unchangedFingerprint);
		assert.deepEqual(getBufferFormatUpdate(unchangedFormat, bumped), { failure: null });
		assert.doesNotThrow(() => assertVersionWasIncreased(unchangedFormat, bumped));
	});

	it('rejects a decreased version even when the layout did not change', () => {
		assert.throws(
			() =>
				assertVersionWasIncreased(unchangedFormat, createBufferFormat(999, unchangedFingerprint)),
			/was decreased from 1000 to 999/
		);
	});

	it('asks to commit the file when it did not exist before', () => {
		assert.match(
			getBufferFormatUpdate(null, unchangedFormat)?.failure ?? '',
			/has been created\. Commit it\./
		);
	});
});

describe('check-buffer-format', () => {
	it('passes against the committed file', () => {
		const result = runCheckBufferFormat(fileURLToPath(bufferFormatFile));
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /buffer format version is valid/);
	});

	it('fails when the layout changed without an increased version', () =>
		withTemporaryDirectory(async directory => {
			const previousFile = path.join(directory, 'buffer-format.json');
			await writeBufferFormat(createChangedLayout(getBufferFormat().version), previousFile);
			const result = runCheckBufferFormat(previousFile);
			assert.equal(result.status, 1, result.stdout);
			assert.match(result.stderr, /was not increased/);
		}));

	it('fails when the previous file is missing', () =>
		withTemporaryDirectory(async directory => {
			const result = runCheckBufferFormat(path.join(directory, 'missing.json'));
			assert.equal(result.status, 1, result.stdout);
			assert.match(result.stderr, /does not exist/);
		}));

	it('fails with a usage error', () => {
		const result = runCheckBufferFormat();
		assert.equal(result.status, 1);
		assert.match(result.stderr, /Usage:/);
	});
});
