import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import {
	assertVersionWasIncreased,
	type BufferFormat,
	type BufferFormatPart,
	getBufferFormat,
	getBufferFormatUpdate,
	readBufferFormat
} from '../buffer-format.ts';

const createBufferFormat = (
	version: number,
	fingerprints: Record<BufferFormatPart, string>
): BufferFormat => ({ fingerprints, version });

const unchangedFingerprints: Record<BufferFormatPart, string> = {
	astNodes: 'astNodes',
	bufferInventory: 'bufferInventory',
	bufferLayout: 'bufferLayout',
	scopeNodes: 'scopeNodes',
	stringConstants: 'stringConstants'
};

const createChangedLayout = (version: number): BufferFormat =>
	createBufferFormat(version, { ...unchangedFingerprints, astNodes: 'changed' });

describe('buffer-format', () => {
	it('fingerprints the declarative layout sources', () => {
		const { fingerprints, version } = getBufferFormat();
		assert.deepEqual(Object.keys(fingerprints), [
			'astNodes',
			'bufferInventory',
			'bufferLayout',
			'scopeNodes',
			'stringConstants'
		]);
		assert.equal(typeof version, 'number');
	});

	it('reads a missing file as absent but rejects an unreadable one', async () => {
		assert.equal(
			await readBufferFormat(new URL('missing-buffer-format.json', import.meta.url)),
			null
		);
		const recordedFormat = await readBufferFormat(
			new URL('../buffer-format.json', import.meta.url)
		);
		assert.deepEqual(Object.keys(recordedFormat ?? {}), ['fingerprints', 'version']);
		await assert.rejects(readBufferFormat(new URL('../../README.md', import.meta.url)));
	});

	it('has nothing to do when the recorded layout is up to date', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		assert.equal(getBufferFormatUpdate(previous, previous), null);
		assert.doesNotThrow(() => assertVersionWasIncreased(previous, previous));
	});

	it('requires a new version and the committed file when the layout changed', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		const current = createBufferFormat(1000, {
			...unchangedFingerprints,
			astNodes: 'changed',
			scopeNodes: 'changed'
		});
		const update = getBufferFormatUpdate(previous, current);
		assert.match(update?.failure ?? '', /layout changed \(astNodes, scopeNodes\)/);
		assert.throws(
			() => assertVersionWasIncreased(previous, current),
			/layout changed \(astNodes, scopeNodes\).*above 1000/
		);
	});

	it('accepts a layout change with an increased version', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		const current = createChangedLayout(1001);
		assert.doesNotThrow(() => assertVersionWasIncreased(previous, current));
		assert.match(getBufferFormatUpdate(previous, current)?.failure ?? '', /layout changed/);
	});

	it('rejects a layout change without an increased version', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		assert.throws(
			() => assertVersionWasIncreased(previous, createChangedLayout(1000)),
			/not increased/
		);
	});

	it('rewrites the file without failing when only the version changed', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		const update = getBufferFormatUpdate(previous, createBufferFormat(1001, unchangedFingerprints));
		assert.deepEqual(update, { failure: null });
		assert.doesNotThrow(() =>
			assertVersionWasIncreased(previous, createBufferFormat(1001, unchangedFingerprints))
		);
	});

	it('rejects a decreased version even when the layout did not change', () => {
		const previous = createBufferFormat(1000, unchangedFingerprints);
		const current = createBufferFormat(999, unchangedFingerprints);
		assert.throws(
			() => assertVersionWasIncreased(previous, current),
			/was decreased from 1000 to 999/
		);
	});

	it('asks to commit the file when it did not exist before', () => {
		const update = getBufferFormatUpdate(null, createBufferFormat(1000, unchangedFingerprints));
		assert.match(update?.failure ?? '', /has been created\. Commit it\./);
	});
});
