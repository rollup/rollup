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
	if (text.length > 5000 && /Apache License/i.test(text) && /TERMS AND CONDITIONS/i.test(text)) {
		return 'Apache-2.0';
	}
	if (/UNICODE LICENSE V3|UNICODE, INC\. LICENSE AGREEMENT/i.test(text)) return 'Unicode-3.0';
	if (/Boost Software License - Version 1\.0/i.test(text)) return 'BSL-1.0';
	if (/Mozilla Public License Version 2\.0/i.test(text)) return 'MPL-2.0';
	if (/CC0 1\.0 Universal/i.test(text)) return 'CC0-1.0';
	if (/Zero-Clause BSD/i.test(text)) return '0BSD';
	if (text.length > 600 && text.includes('Permission is hereby granted, free of charge'))
		return 'MIT';
	if (
		text.length > 800 &&
		/Redistribution and use in source and binary forms/i.test(text) &&
		/THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS/i.test(text)
	) {
		return /Neither the name|The names of the contributors|neither the name/i.test(text)
			? 'BSD-3-Clause'
			: 'BSD-2-Clause';
	}
	if (text.length > 600 && /Permission to use, copy, modify, and(\/or)? distribute/i.test(text)) {
		return /appear in all copies/i.test(text) ? 'ISC' : '0BSD';
	}
	if (/This software is provided 'as-is'/i.test(text)) return 'Zlib';
	if (/This is free and unencumbered software released into the public domain/i.test(text)) {
		return 'Unlicense';
	}
	return null;
}

/**
 * Distinguishes a license template (e.g. "Copyright [yyyy] [name of copyright
 * owner]") from a notice naming an actual copyright holder. Matched at the start
 * of a line because license bodies also mention "copyright notice" in running text.
 *
 * @param {string} text
 * @return {boolean}
 */
export function hasConcreteCopyrightNotice(text) {
	return /^(?:Copyright|©)(?!\s*(?:\(c\)\s*)?[[{<])/m.test(text);
}
