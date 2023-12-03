<template>
	<div
		class="status"
		:class="
			waiting
				? 'waiting'
				: error
				  ? 'error'
				  : hasWarnings
				    ? 'warnings'
				    : logs.length > 0
				      ? 'logs'
				      : 'success'
		"
	>
		<span v-if="waiting">
			<span class="repl-icon-attention"></span>
			Loading Rollup...
		</span>
		<StatusMessage v-else-if="error" :message="error" isError />
		<span v-else-if="hasWarnings">
			<span class="repl-icon-attention" />
			Rollup completed with warnings:
			<ul class="log-list">
				<li v-for="([, log], i) in logs" :key="i" class="log">
					<StatusMessage :message="log" />
				</li>
			</ul>
		</span>
		<span v-else-if="logs.length > 0">
			Rollup completed with logs:
			<ul class="log-list">
				<li v-for="([, log], i) in logs" :key="i" class="log">
					<StatusMessage :message="log" />
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
import { LOGLEVEL_WARN } from '../../../src/utils/logging';
import { useRollup } from '../stores/rollup';
import { useRollupOutput } from '../stores/rollupOutput';
import StatusMessage from './StatusMessage.vue';

const rollupStore = useRollup();
const rollupOutputStore = useRollupOutput();

const waiting = computed(() => !(rollupStore.loaded.instance || rollupStore.loaded.error));
const error = computed(() => rollupOutputStore.output.error);
const logs = computed(() => rollupOutputStore.output.logs);
const hasWarnings = computed(() => logs.value.some(([level]) => level === LOGLEVEL_WARN));
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

.logs {
	background-color: var(--log-background);
	color: var(--log-color);
}

.log {
	margin-top: 16px;
}

.error {
	background-color: var(--error-background);
	color: var(--error-color);
}

.status > span {
	font-size: 1em;
}

.log-list {
	list-style-type: none;
	padding-inline-start: 0;
	margin-top: 10px;
	margin-bottom: 0;
}
</style>
