declare module 'github-api' {
	export interface Repo {
		listPullRequests({ state: string }): Promise<{
			data: { number: number; title: string; head: { sha: string } }[];
		}>;

		getPullRequest(pr: number): Promise<{ data: { body: string; user: { login: string } } }>;

		createRelease(release: { body: string; name: string; tag_name: string }): Promise<void>;
	}

	export interface Issues {
		createIssueComment(issueNumber: number, text: string): Promise<void>;
	}

	export default class GitHub {
		constructor({ token: string });

		getRepo(organization: string, repository: string): Repo;

		getIssues(organization: string, repository: string): Issues;
	}
}
