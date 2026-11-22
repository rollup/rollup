import { createHash } from 'node:crypto';

/**
 * Collapses whitespace so that the same license text shipped with different
 * indentation, line endings or trailing spaces is recognized as identical.
 *
 * @param {string} text
 * @return {string}
 */
export function normalizeText(text) {
	return text
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map(line => line.replaceAll(/\s+/g, ' ').trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Fragment text ids are only local keys. The assembler re-derives the ids from
 * the normalized text that ends up in the license files.
 *
 * @param {string} text
 * @return {string}
 */
export function getTextId(text) {
	return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/**
 * @param {string} valueA
 * @param {string} valueB
 * @return {number}
 */
export function compareStrings(valueA, valueB) {
	return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
}

/**
 * @param {string | null} expression
 * @return {string[]}
 */
export function parseLicenseIds(expression) {
	if (!expression) return [];
	const ids = new Set();
	for (const part of expression.split(/\s+(?:OR|AND)\s+|\//)) {
		const id = part.replaceAll(/[()]/g, '').replaceAll(/\s+/g, ' ').trim();
		if (id) ids.add(id);
	}
	return [...ids].sort(compareStrings);
}

/**
 * Expects normalized text. Only full license texts are classified; the many
 * short "licensed under X, see LICENSE-X" pointer files stay unclassified.
 *
 * @param {string} text
 * @return {string | null}
 */
export function classifyLicenseText(text) {
	const flatText = text.replaceAll(/\s+/g, ' ');
	if (/LLVM Exceptions? to the Apache 2\.0 License/i.test(flatText))
		return 'Apache-2.0 WITH LLVM-exception';
	if (
		flatText.length > 5000 &&
		/Apache License/i.test(flatText) &&
		/TERMS AND CONDITIONS/i.test(flatText)
	) {
		return 'Apache-2.0';
	}
	if (/UNICODE LICENSE V3|UNICODE, INC\. LICENSE AGREEMENT/i.test(flatText)) return 'Unicode-3.0';
	if (/Boost Software License - Version 1\.0/i.test(flatText)) return 'BSL-1.0';
	if (/Mozilla Public License Version 2\.0/i.test(flatText)) return 'MPL-2.0';
	if (/CC0 1\.0 Universal/i.test(flatText)) return 'CC0-1.0';
	if (/Zero-Clause BSD/i.test(flatText)) return '0BSD';
	if (flatText.length > 600 && flatText.includes('Permission is hereby granted, free of charge')) {
		return 'MIT';
	}
	if (
		flatText.length > 800 &&
		/Redistribution and use in source and binary forms/i.test(flatText) &&
		/THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS/i.test(flatText)
	) {
		return /Neither the name|The names of the contributors|neither the name/i.test(flatText)
			? 'BSD-3-Clause'
			: 'BSD-2-Clause';
	}
	if (
		flatText.length > 600 &&
		/Permission to use, copy, modify, and(\/or)? distribute/i.test(flatText)
	) {
		return /appear in all copies/i.test(flatText) ? 'ISC' : '0BSD';
	}
	if (/This software is provided 'as-is'/i.test(flatText)) return 'Zlib';
	if (/This is free and unencumbered software released into the public domain/i.test(flatText)) {
		return 'Unlicense';
	}
	return null;
}

const LICENSE_TITLE_LINE = /^\s*(?:the\s+)?(?:mit|isc)\s+licen[cs]e\s*(?:\(mit\))?[\s.:]*$/i;
const COPYRIGHT_NOTICE_LINE = /^\s*(?:[#*>-]\s*)?(?:Copyright\b(?!\s*(?:\(c\)\s*)?[[{<])|©)/;
const ALL_RIGHTS_RESERVED_LINE = /^\s*all rights reserved\.?\s*$/i;
const APACHE_APPENDIX_LINE = /^APPENDIX: How to apply the Apache License to your work/;
const APACHE_APPENDIX_END_LINE = /limitations under the License\./;

/**
 * @param {string} line
 * @return {boolean}
 */
export function isCopyrightNotice(line) {
	return COPYRIGHT_NOTICE_LINE.test(line) || ALL_RIGHTS_RESERVED_LINE.test(line);
}

/**
 * The appendix only explains how to attach the boilerplate notice and is given
 * in several cosmetic variants; dropping it lets all Apache texts share one body.
 * Anything appended after the boilerplate is kept.
 *
 * @param {string} body
 * @return {string}
 */
function stripApacheAppendix(body) {
	const lines = body.split('\n');
	const appendixIndex = lines.findIndex(line => APACHE_APPENDIX_LINE.test(line));
	if (appendixIndex === -1) return body;
	const appendixEndIndex = lines.findIndex(
		(line, index) => index > appendixIndex && APACHE_APPENDIX_END_LINE.test(line)
	);
	if (appendixEndIndex === -1) return body;
	const appendedText = lines
		.slice(appendixEndIndex + 1)
		.join('\n')
		.trim();
	return [lines.slice(0, appendixIndex).join('\n').trim(), appendedText]
		.filter(Boolean)
		.join('\n\n');
}

/**
 * Splits a license text into the notices that identify the package shipping it
 * and the reusable license body. Title lines are decoration and are dropped.
 *
 * @param {string} text normalized license text
 * @return {{ attribution: string[]; body: string }}
 */
export function splitLicenseText(text) {
	const attribution = [];
	const bodyLines = [];
	for (const line of text.split('\n')) {
		if (LICENSE_TITLE_LINE.test(line)) continue;
		if (isCopyrightNotice(line)) {
			attribution.push(line.trim());
		} else {
			bodyLines.push(line);
		}
	}
	const body = stripApacheAppendix(
		bodyLines
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim()
	);
	return { attribution, body };
}
