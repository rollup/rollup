import type { Issues, Repo } from 'github-api';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

const RELEASE_SCRIPTS_SOURCE = path.join(REPO_ROOT, 'scripts');
const RELEASE_SCRIPT_FILES = [
	'check-release.ts',
	'colors.ts',
	'helpers.ts',
	'package.json',
	'postpublish.ts',
	'prepare-release.ts',
	'prepublish.ts',
	'publish-wasm-node-package.ts',
	'release-constants.ts',
	'release-helpers.ts'
];
const BASE_VERSION = '4.9.0';
const ENTRY_4_8_0 = '## 4.8.0\n\n__2024-11-30__\n\n### Bug Fixes\n\n- Nothing important (#98)';
const ENTRY_4_9_0 = '## 4.9.0\n\n__2025-01-15__\n\n### Features\n\n- Add a thing (#99)';
const INITIAL_CHANGELOG = `${ENTRY_4_8_0}\n`;

export const DEFAULT_CHANGELOG = `${ENTRY_4_9_0}\n\n${ENTRY_4_8_0}\n`;
export { ENTRY_4_8_0, ENTRY_4_9_0 };

interface ReleaseCommit {
	changelog?: string;
	version: string;
}

export interface WorkspaceOptions {
	branch?: string;
	changelog?: string;
	commits?: string[];
	releases?: ReleaseCommit[];
}

interface SelectPromptCall {
	choices: readonly unknown[];
	message: string;
	values: unknown[];
}

interface ListPullRequestsFilter {
	head?: string;
	state: string;
}

export interface FakeGitHubState {
	createdIssues: { comment: string; issueNumber: number }[];
	createdReleases: { body: string; name: string; tag_name: string }[];
	listPullRequestsFilters: ListPullRequestsFilter[];
	openPullRequests: { head: { sha: string }; number: number; title: string }[];
	pullRequestCommits: Map<
		number,
		{ author: { login: string } | null; commit: { author: { name: string } } }[]
	>;
	pullRequests: Map<number, { body: string; user: { login: string } }>;
}

interface SavedEnvironmentValues {
	GIT_CONFIG_GLOBAL: string | undefined;
	GIT_CONFIG_NOSYSTEM: string | undefined;
	GIT_DIR: string | undefined;
	GIT_INDEX_FILE: string | undefined;
	GIT_WORK_TREE: string | undefined;
	npm_config_dry_run: string | undefined;
	npm_config_registry: string | undefined;
	PATH: string | undefined;
}

export interface Workspace {
	dispose(): Promise<void>;
	githubState: FakeGitHubState;
	gitInWorkspace(gitArguments: string[]): string;
	originBranchExists(branch: string): boolean;
	originRef(reference: string): string;
	readFileInWorkspace(filePath: string): Promise<string>;
	readNpmLog(): Promise<string[]>;
	repoPath: string;
	scriptPath(scriptFile: string): string;
	selectAnswers: string[];
	selectCalls: SelectPromptCall[];
	workspaceRef(reference: string): string;
}

function applyWorkspaceEnvironment(binPath: string): SavedEnvironmentValues {
	const savedEnvironment: SavedEnvironmentValues = {
		GIT_CONFIG_GLOBAL: process.env.GIT_CONFIG_GLOBAL,
		GIT_CONFIG_NOSYSTEM: process.env.GIT_CONFIG_NOSYSTEM,
		GIT_DIR: process.env.GIT_DIR,
		GIT_INDEX_FILE: process.env.GIT_INDEX_FILE,
		GIT_WORK_TREE: process.env.GIT_WORK_TREE,
		npm_config_dry_run: process.env.npm_config_dry_run,
		npm_config_registry: process.env.npm_config_registry,
		PATH: process.env.PATH
	};
	process.env.PATH = `${binPath}${path.delimiter}${process.env.PATH}`;
	process.env.npm_config_dry_run = 'true';
	process.env.npm_config_registry = 'http://127.0.0.1:9';
	process.env.GIT_CONFIG_GLOBAL = '/dev/null';
	process.env.GIT_CONFIG_NOSYSTEM = '1';
	delete process.env.GIT_DIR;
	delete process.env.GIT_WORK_TREE;
	delete process.env.GIT_INDEX_FILE;
	return savedEnvironment;
}

function restoreEnvironment(savedEnvironment: SavedEnvironmentValues): void {
	for (const [key, value] of Object.entries(savedEnvironment)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
}

function runGit(gitArguments: string[], cwd: string): string {
	const result = spawnSync('git', gitArguments, { cwd, encoding: 'utf8' });
	if (result.status !== 0 || result.error) {
		throw new Error(`git ${gitArguments.join(' ')} in ${cwd} failed: ${result.stderr}`);
	}
	return result.stdout.trim();
}

function writeNpmShims(binPath: string, logPath: string): void {
	const shimContent = `#!/bin/sh
echo "$(pwd) $*" >> "${logPath}"
if [ "$1 $2" = "run prepublish:napi" ]; then
	node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); pkg.optionalDependencies = { '@rollup-napi-darwin-arm64': '9.9.9' }; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))"
fi
`;
	for (const shimName of ['npm', 'npx']) {
		writeFileSync(path.join(binPath, shimName), shimContent, { mode: 0o755 });
	}
}

async function writePackageFiles(version: string, repoPath: string): Promise<void> {
	await Promise.all([
		writeFile(
			path.join(repoPath, 'package.json'),
			JSON.stringify(
				{
					description: 'Next-generation ES module bundler',
					files: ['dist', 'cli', 'native.js'],
					name: 'rollup',
					optionalDependencies: { '@rollup/rollup-linux-x64-gnu': version },
					scripts: { 'ci:lint': 'echo lint', 'prepublish:napi': 'echo napi' },
					type: 'module',
					version
				},
				null,
				2
			)
		),
		writeFile(
			path.join(repoPath, 'package-lock.json'),
			JSON.stringify(
				{
					lockfileVersion: 3,
					name: 'rollup',
					packages: { '': { name: 'rollup', version } },
					version
				},
				null,
				2
			)
		),
		writeFile(
			path.join(repoPath, 'browser', 'package.json'),
			JSON.stringify({ name: 'rollup-browser', version }, null, 2)
		)
	]);
}

async function writeFixtureFiles(initialChangelog: string, repoPath: string): Promise<void> {
	await mkdir(path.join(repoPath, 'dist'), { recursive: true });
	await mkdir(path.join(repoPath, 'artifacts', 'bindings-wasm-node', 'wasm-node'), {
		recursive: true
	});
	await mkdir(path.join(repoPath, 'browser'), { recursive: true });
	await writePackageFiles(BASE_VERSION, repoPath);
	await Promise.all([
		writeFile(path.join(repoPath, 'LICENSE.md'), 'License text\n'),
		writeFile(path.join(repoPath, 'native.wasm.js'), 'export default {};\n'),
		writeFile(path.join(repoPath, '.github_token'), 'dummy-token\n'),
		writeFile(path.join(repoPath, 'dist', 'index.js'), 'export {};\n'),
		writeFile(
			path.join(repoPath, 'artifacts', 'bindings-wasm-node', 'wasm-node', 'placeholder.txt'),
			'placeholder\n'
		),
		writeFile(path.join(repoPath, 'CHANGELOG.md'), initialChangelog)
	]);
}

async function copyReleaseScripts(scriptCopyPath: string): Promise<void> {
	await Promise.all(
		RELEASE_SCRIPT_FILES.map(scriptFile =>
			copyFile(path.join(RELEASE_SCRIPTS_SOURCE, scriptFile), path.join(scriptCopyPath, scriptFile))
		)
	);
}

function createGithubApiMockModule(state: FakeGitHubState) {
	return {
		default: class FakeGitHub {
			getIssues(): Issues {
				return {
					async createIssueComment(issueNumber: number, comment: string): Promise<void> {
						state.createdIssues.push({ comment, issueNumber });
					}
				};
			}

			getRepo(): Repo {
				return {
					async createRelease(release: {
						body: string;
						name: string;
						tag_name: string;
					}): Promise<void> {
						state.createdReleases.push(release);
					},
					async getPullRequest(prNumber: number) {
						return {
							data: state.pullRequests.get(prNumber) ?? {
								body: '',
								user: { login: `author-${prNumber}` }
							}
						};
					},
					async listCommitsOnPR(prNumber: number) {
						return {
							data: state.pullRequestCommits.get(prNumber) ?? [
								{
									author: { login: `author-${prNumber}` },
									commit: { author: { name: `commit-author-${prNumber}` } }
								}
							]
						};
					},
					async listPullRequests(filter: ListPullRequestsFilter) {
						state.listPullRequestsFilters.push(filter);
						return { data: state.openPullRequests };
					}
				};
			}
		}
	};
}

export function createGithubApiMocks(state: FakeGitHubState): { 'github-api': unknown } {
	return { 'github-api': createGithubApiMockModule(state) };
}

function createChoiceValues(choices: readonly unknown[]): unknown[] {
	return choices.map(choice =>
		typeof choice === 'object' && choice !== null && 'value' in choice
			? (choice as { value: unknown }).value
			: choice
	);
}

export function createInquirerMocks(
	selectAnswers: string[],
	selectCalls: SelectPromptCall[]
): {
	'@inquirer/prompts': {
		select: (prompt: { choices: readonly unknown[]; message: string }) => Promise<string>;
	};
} {
	return {
		'@inquirer/prompts': {
			async select(prompt: { choices: readonly unknown[]; message: string }): Promise<string> {
				const values = createChoiceValues(prompt.choices);
				selectCalls.push({ choices: prompt.choices, message: prompt.message, values });
				const answer = selectAnswers.shift();
				if (answer === undefined) {
					throw new Error(`Unexpected select prompt: "${prompt.message}"`);
				}
				if (!values.includes(answer)) {
					throw new Error(
						`Select answer "${answer}" is not among the offered choices of "${prompt.message}"`
					);
				}
				return answer;
			}
		}
	};
}

async function createWorkspace(options: WorkspaceOptions): Promise<Workspace> {
	await mkdir(path.join(REPO_ROOT, 'tmp'), { recursive: true });
	const savedCwd = process.cwd();
	const temporaryPath = await mkdtemp(path.join(REPO_ROOT, 'tmp', 'release-scripts-'));
	const repoPath = path.join(temporaryPath, 'repo');
	const originPath = path.join(temporaryPath, 'origin.git');
	const binPath = path.join(temporaryPath, 'bin');
	const scriptCopyPath = path.join(repoPath, 'scripts');
	const selectCalls: SelectPromptCall[] = [];
	const selectAnswers: string[] = [];
	const githubState: FakeGitHubState = {
		createdIssues: [],
		createdReleases: [],
		listPullRequestsFilters: [],
		openPullRequests: [],
		pullRequestCommits: new Map(),
		pullRequests: new Map()
	};

	await mkdir(binPath, { recursive: true });
	await mkdir(originPath, { recursive: true });
	await mkdir(scriptCopyPath, { recursive: true });
	writeNpmShims(binPath, path.join(temporaryPath, 'npm-calls.log'));
	const savedEnvironment = applyWorkspaceEnvironment(binPath);
	await copyReleaseScripts(scriptCopyPath);
	await writeFixtureFiles(INITIAL_CHANGELOG, repoPath);

	runGit(['init', '-b', 'master'], repoPath);
	runGit(['config', 'user.name', 'Test User'], repoPath);
	runGit(['config', 'user.email', 'test-user@example.org'], repoPath);
	runGit(['init', '--bare'], originPath);
	runGit(['remote', 'add', 'origin', originPath], repoPath);

	runGit(['add', '-A'], repoPath);
	runGit(['commit', '-m', 'Initial commit'], repoPath);
	runGit(['tag', 'v4.8.0'], repoPath);

	await writeChangelog(options.changelog ?? DEFAULT_CHANGELOG, repoPath);
	runGit(['add', '-A'], repoPath);
	runGit(['commit', '-m', 'Add a thing (#99)'], repoPath);
	runGit(['tag', 'v4.9.0'], repoPath);

	for (const commitMessage of options.commits ?? []) {
		runGit(['commit', '--allow-empty', '-m', commitMessage], repoPath);
	}

	for (const release of options.releases ?? []) {
		await writeChangelog(release.changelog ?? DEFAULT_CHANGELOG, repoPath);
		await writePackageFiles(release.version, repoPath);
		runGit(['add', '-A'], repoPath);
		runGit(['commit', '-m', release.version], repoPath);
		runGit(['tag', `v${release.version}`], repoPath);
	}

	runGit(['push', '-u', 'origin', 'master'], repoPath);
	runGit(['push', '--tags'], repoPath);

	if (options.branch) {
		runGit(['checkout', '-b', options.branch], repoPath);
		runGit(['push', '-u', 'origin', options.branch], repoPath);
	}

	return {
		async dispose(): Promise<void> {
			restoreEnvironment(savedEnvironment);
			process.chdir(savedCwd);
			await rm(temporaryPath, { force: true, recursive: true });
		},
		githubState,
		gitInWorkspace(gitArguments: string[]): string {
			return runGit(gitArguments, repoPath);
		},
		originBranchExists(branch: string): boolean {
			try {
				return runGit(['rev-parse', `refs/heads/${branch}`], originPath).length > 0;
			} catch {
				return false;
			}
		},
		originRef(reference: string): string {
			return runGit(['rev-parse', reference], originPath);
		},
		async readFileInWorkspace(filePath: string): Promise<string> {
			return readFile(path.join(repoPath, filePath), 'utf8');
		},
		async readNpmLog(): Promise<string[]> {
			try {
				return (await readFile(path.join(temporaryPath, 'npm-calls.log'), 'utf8'))
					.split('\n')
					.filter(line => line.length > 0);
			} catch {
				return [];
			}
		},
		repoPath,
		scriptPath(scriptFile: string): string {
			return path.join(scriptCopyPath, scriptFile);
		},
		selectAnswers,
		selectCalls,
		workspaceRef(reference: string): string {
			return runGit(['rev-parse', reference], repoPath);
		}
	};
}

async function writeChangelog(content: string, repoPath: string): Promise<void> {
	await writeFile(path.join(repoPath, 'CHANGELOG.md'), content);
}

export async function withWorkspace(
	options: WorkspaceOptions,
	run: (workspace: Workspace) => Promise<void>
): Promise<void> {
	const workspace = await createWorkspace(options);
	try {
		await run(workspace);
	} finally {
		await workspace.dispose();
	}
}
