<template>
	<div class="codemirror-container" ref="editorContainer"></div>
</template>

<script setup lang="ts">
import type { EditorView } from '@codemirror/view';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { LogLevel, RollupLog } from '../../../src/rollup/types';
import { LOGLEVEL_ERROR } from '../../../src/utils/logging';
import type { AddLogs } from '../helpers/editor';
import { getFileNameFromMessage } from '../helpers/messages';
import { useRollupOutput } from '../stores/rollupOutput';

const editorContainer = ref<HTMLElement | null>(null);
const properties = defineProps<{
	code: string;
	moduleName?: string;
	readonly?: boolean;
}>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{ (event: 'update:code', code: string): void }>();
let addLogsEffect: AddLogs;
let editor: EditorView;
// eslint-disable-next-line vue/no-setup-props-destructure
let previousCode = properties.code;

onMounted(async () => {
	const { createEditor, addLogs } = await import('../helpers/editor');
	addLogsEffect = addLogs;
	editor = createEditor(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		editorContainer.value!,
		properties.code,
		({ changedRanges, state: { doc } }) => {
			if (changedRanges.length > 0) {
				previousCode = doc.toString();
				emit('update:code', doc.toString());
			}
		},
		!!properties.readonly
	);

	watch(
		() => properties.code,
		code => {
			if (previousCode !== code) {
				previousCode = code;
				editor.dispatch({
					changes: { from: 0, insert: code, to: editor.state.doc.length }
				});
			}
		}
	);

	if (properties.moduleName && !properties.readonly) {
		const addMarkers = (messages: [LogLevel | 'error', RollupLog][]) => {
			const relevantMessages = messages.filter(
				(message): message is [LogLevel | 'error', RollupLog & { pos: number }] =>
					typeof message[1].pos === 'number' &&
					getFileNameFromMessage(message[1]) === `/${properties.moduleName}`
			);
			editor.dispatch({ effects: [addLogsEffect.of({ messages: relevantMessages })] });
		};

		const outputStore = useRollupOutput();

		watch(
			() => outputStore.output,
			({ error, logs }) => {
				if (error) {
					addMarkers([[LOGLEVEL_ERROR, error]]);
				} else {
					addMarkers(logs);
				}
			}
		);
	}
});

onUnmounted(() => {
	editor?.destroy();
});
</script>

<style scoped>
.codemirror-container {
	width: 100%;
	height: 100%;
}
</style>
