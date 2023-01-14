<template>
	<OutputStatus />
	<BundleOptions />
	<div v-if="!rollupOutputStore.output.error">
		<article v-for="chunk in rollupOutputStore.output.output" :key="chunk.fileName" class="output">
			<header v-if="rollupOutputStore.output.output.length > 1">
				<span class="module-name">{{ chunk.fileName }}</span>
			</header>
			<ReplEditor v-model:code="chunk.code" readonly />
		</article>
	</div>
</template>

<script setup lang="ts">
import { useRollupOutput } from '../stores/rollupOutput';
import BundleOptions from './BundleOptions.vue';
import OutputStatus from './OutputStatus.vue';
import ReplEditor from './ReplEditor.vue';

const rollupOutputStore = useRollupOutput();
rollupOutputStore.output.error;
</script>

<style scoped>
.output {
	margin: 0 0 0.5rem 0;
	border-radius: 8px;
	background-color: var(--vp-c-bg-mute);
	color: var(--vp-c-text-1);
}

.module-name {
	display: block;
	padding: 0.5em;
}

header {
	width: 100%;
}
</style>
