<template>
	<div class="codemirror-container" ref="editorContainer"></div>
</template>

<script setup lang="ts">
import type { EditorView } from '@codemirror/view';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { RollupLog } from '../../../src/rollup/types';
import type { AddWarnings } from '../helpers/editor';
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
let addWarningsEffect: AddWarnings;
let editor: EditorView;
// eslint-disable-next-line vue/no-setup-props-destructure
let previousCode = properties.code;

onMounted(async () => {
	const { createEditor, addWarnings } = await import('../helpers/editor');
	addWarningsEffect = addWarnings;
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
		const addMarkers = (messages: RollupLog[], type: 'warning' | 'error') => {
			const relevantMessages = messages.filter(
				(message): message is RollupLog & { pos: number } =>
					typeof message.pos === 'number' &&
					getFileNameFromMessage(message) === `/${properties.moduleName}`
			);
			editor.dispatch({ effects: [addWarningsEffect.of({ messages: relevantMessages, type })] });
		};

		const outputStore = useRollupOutput();

		watch(
			() => outputStore.output,
			({ error, warnings }) => {
				if (error) {
					addMarkers([error], 'error');
				} else {
					addMarkers(warnings, 'warning');
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
