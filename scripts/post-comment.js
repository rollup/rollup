#!/usr/bin/env node

const path = require('path');
const fetch = require('node-fetch');

const authToken = process.env.GH_AUTH_TOKEN;
if (!authToken) {
	console.log('Could not find auth token.');
	process.exit(0);
}

const prNumber = path.basename(
	process.env.CIRCLE_PULL_REQUEST || process.env.CI_PULL_REQUEST || ''
);
if (!prNumber) {
	console.log('No pull request number found');
	process.exit(0);
}

const headline = '### Thank you for your contribution! ❤️';

postComment();

async function postComment() {
	const existingId = await findExistingComment();
	console.log(existingId ? `Update comment ${existingId}` : 'Create new comment.');
	const installPath = await getInstallPath();
	const path = existingId ? `issues/comments/${existingId}` : `issues/${prNumber}/comments`;
	const method = existingId ? 'PATCH' : 'POST';
	await fetch(getApiUrl(path), {
		method,
		body: JSON.stringify({
			body: `${headline}

You can try out this pull request locally by installing Rollup via

\`\`\`
npm install ${installPath}
\`\`\`

or load it into the REPL:
https://rollupjs.org/repl/?circleci=${process.env.CIRCLE_BUILD_NUM}
`
		})
	});
}

async function findExistingComment() {
	const comments = await (await fetch(getApiUrl(`issues/${prNumber}/comments`), {})).json();
	const existingComment = comments.find(comment => comment.body.startsWith(headline));
	return existingComment && existingComment.id;
}

async function getInstallPath() {
	const prInfo = await (await fetch(getApiUrl(`pulls/${prNumber}`), {})).json();
	return `${prInfo.head.repo.full_name}#${prInfo.head.ref}`;
}

function getApiUrl(path) {
	return `https://${authToken}:x-oauth-basic@api.github.com/repos/rollup/rollup/${path}`;
}
