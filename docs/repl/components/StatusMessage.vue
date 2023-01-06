<template>
	<div class="message">
		<span v-if="isError">
			<span class="icon icon-error" />
			<strong>{{ ' ' + message.name }}:</strong>
		</span>
		{{ message.message }}
		<a
			v-if="isGuideUrl(message.url)"
			:href="message.url.slice(websitePrefix.length)"
			class="link"
			:class="{ error: isError }"
			>(<span class="link-text">link</span>)</a
		>
	</div>
	<pre v-if="frame" class="frame"><code>{{ frame }}</code></pre>
</template>

<script setup lang="ts">
import type { RollupError } from 'rollup';
import { computed } from 'vue';
import { getFileNameFromMessage } from '../helpers/messages';

const properties = defineProps<{ isError?: boolean; message: RollupError }>();

const websitePrefix = 'https://rollupjs.org/';

const frame = computed(() => {
	const { loc, id, frame } = properties.message;
	const fileName = getFileNameFromMessage({ id, loc });
	if (fileName) {
		const location = loc ? ` (${loc.line}:${loc.column})` : '';
		return `${fileName}${location}${frame ? '\n' : ''}${frame}`;
	}
	return '';
});

// TODO Lukas adjust to updated guide links?
const isGuideUrl = (url: string) => url && url.startsWith(websitePrefix);
</script>

<style scoped>
.message {
	line-height: 1;
}

.frame {
	overflow: hidden;
	word-break: normal;
	margin: 5px 0;
}

.link {
	margin: 0 2px;
}

.link-text {
	border-bottom: 1px solid #dd9999;
}

.link.error {
	color: #eeeeee;
}

.link.error .link-text {
	border-bottom: 1px solid #ffaaaa;
}
</style>
