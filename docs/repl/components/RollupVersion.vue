<template>
	<!-- eslint-disable-next-line vue/no-v-html-->
	<div class="version" v-html="version"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRollup } from '../stores/rollup';

const rollupStore = useRollup();

const getPRLink = (pr: string) =>
	`<a href="https://github.com/rollup/rollup/pull/${pr}">#${pr}</a>`;

const getVersionLink = (version: string) =>
	`<a href="https://github.com/rollup/rollup/releases/tag/v${version}">${version}</a>`;

const version = computed(() => {
	if (!rollupStore.request) {
		return 'Loading Rollup …  ';
	}
	const { type, version } = rollupStore.request;
	const actualVersion = rollupStore.loaded.instance?.VERSION;
	if (type === 'local') {
		return actualVersion
			? `Local development build (${actualVersion})`
			: 'Loading local development build …';
	}
	if (type === 'pr') {
		return actualVersion
			? `Pull request ${getPRLink(version)} (${actualVersion})`
			: `Loading pull request ${getPRLink(version)} …`;
	}
	return actualVersion
		? `Rollup ${getVersionLink(actualVersion)}`
		: `Loading Rollup ${version || '(latest)'} …`;
});
</script>

<style scoped>
.version {
	font-size: 14px;
	color: var(--vp-c-text-3);
}
</style>

<style>
.version a {
	color: var(--vp-c-text-1);
}
</style>
