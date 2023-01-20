<template>
	<OutputStatus />
	<BundleOptions />
	<RollupVersion />
	<div v-if="!rollupOutputStore.output.error">
		<ReplModule
			v-for="chunk in chunkModules"
			:module="chunk"
			:key="chunk.name"
			:show-header="rollupOutputStore.output.output.length > 1"
		/>
	</div>
</template>

<script setup lang="ts">
import type { OutputChunk } from 'rollup';
import { computed } from 'vue';
import type { Module } from '../../types';
import { useRollupOutput } from '../stores/rollupOutput';
import BundleOptions from './BundleOptions.vue';
import OutputStatus from './OutputStatus.vue';
import ReplModule from './ReplModule.vue';
import RollupVersion from './RollupVersion.vue';

const rollupOutputStore = useRollupOutput();
const chunkModules = computed<Module[]>(() =>
	(
		rollupOutputStore.output.output.filter(
			(chunk): chunk is OutputChunk => chunk.type === 'chunk'
		) as OutputChunk[]
	).map(({ code, fileName }) => ({ code, isEntry: false, name: fileName }))
);
</script>
