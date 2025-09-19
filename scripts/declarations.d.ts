declare module 'github-api' {
	export interface Repo {
		listPullRequests(filter: { state: string }): Promise<{
			data: { number: number; title: string; head: { sha: string } }[];
		}>;

		listCommitsOnPR(pr: number): Promise<{
			data: { author: { login: string } | null; commit: { author: { name: string } } }[];
		}>;

		getPullRequest(pr: number): Promise<{ data: { body: string; user: { login: string } } }>;

		createRelease(release: { body: string; name: string; tag_name: string }): Promise<void>;
	}

	export interface Issues {
		createIssueComment(issueNumber: number, text: string): Promise<void>;
	}

	export default class GitHub {
		constructor(options: { token: string });

		getRepo(organization: string, repository: string): Repo;

		getIssues(organization: string, repository: string): Issues;
	}
}
