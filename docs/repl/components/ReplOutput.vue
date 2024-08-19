<template>
	<OutputStatus />
	<BundleOptions />
	<RollupVersion />
	<div v-if="!rollupOutputStore.output.error">
		<ReplModule
			v-for="chunk in chunkModules"
			:key="chunk.name"
			:module="chunk"
			:show-header="rollupOutputStore.output.output.length > 1"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Module } from '../../types';
import { useRollupOutput } from '../stores/rollupOutput';
import BundleOptions from './BundleOptions.vue';
import OutputStatus from './OutputStatus.vue';
import ReplModule from './ReplModule.vue';
import RollupVersion from './RollupVersion.vue';

const rollupOutputStore = useRollupOutput();
const chunkModules = computed<Module[]>(() =>
	rollupOutputStore.output.output.map(chunk => ({
		code: 'code' in chunk ? chunk.code : String(chunk.source),
		isEntry: false,
		name: chunk.fileName
	}))
);
</script>
