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
import ReplEditor from './ReplEditor.vue';
import OutputStatus from './OutputStatus.vue';
import BundleOptions from './BundleOptions.vue';

const rollupOutputStore = useRollupOutput();
rollupOutputStore.output.error;
</script>

<style scoped>
.output {
	margin: 0 0 0.5rem 0;
	border: 1px solid #eee;
}

.module-name {
	display: block;
	padding: 0.5em;
}

header {
	width: 100%;
	border-bottom: 1px solid #f4f4f4;
}
</style>
