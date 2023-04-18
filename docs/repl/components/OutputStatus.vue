<template>
	<div
		class="status"
		:class="waiting ? 'waiting' : error ? 'error' : warnings.length > 0 ? 'warnings' : 'success'"
	>
		<span v-if="waiting">
			<span class="repl-icon-attention"></span>
			Loading Rollup...
		</span>
		<StatusMessage v-else-if="error" :message="error" isError />
		<span v-else-if="warnings.length > 0">
			<span class="repl-icon-attention" />
			Rollup completed with warnings:
			<ul class="warning-list">
				<li v-for="(warning, i) in warnings" :key="i" class="warning">
					<StatusMessage :message="warning" />
				</li>
			</ul>
		</span>
		<span v-else>
			<span class="repl-icon-ok"></span>
			Rollup successful!
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRollup } from '../stores/rollup';
import { useRollupOutput } from '../stores/rollupOutput';
import StatusMessage from './StatusMessage.vue';

const rollupStore = useRollup();
const rollupOutputStore = useRollupOutput();

const waiting = computed(() => !(rollupStore.loaded.instance || rollupStore.loaded.error));
const error = computed(() => rollupOutputStore.output.error);
const warnings = computed(() => rollupOutputStore.output.warnings);
</script>

<style scoped>
.status {
	padding: 0.7em;
	margin: 0 0 0.5rem 0;
	color: white;
	word-break: break-word;
	line-height: 1;
	border-radius: 8px;
	transition: all 0.2s;
}

.success {
	background-color: #3d9970;
}

.waiting {
	background-color: #4384e6;
}

.warnings {
	background-color: var(--warning-background);
	color: var(--warning-color);
}

.warning {
	margin-top: 16px;
}

.error {
	background-color: var(--error-background);
	color: var(--error-color);
}

.status > span {
	font-size: 1em;
}

.warning-list {
	list-style-type: none;
	padding-inline-start: 0;
	margin-top: 10px;
	margin-bottom: 0;
}
</style>
