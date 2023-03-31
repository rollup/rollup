<template>
	<div class="repl">
		<div class="left">
			<h2>ES6 modules go in...</h2>
			<div class="input">
				<ReplInput />
			</div>
		</div>
		<div class="right">
			<h2>
				...
				{{ rollupOutputStore.output.length > 1 ? 'chunks come' : 'bundle comes' }}
				out
			</h2>
			<div class="output">
				<ReplOutput />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSyncQueryWithStores, useUpdateStoresFromQuery } from '../helpers/query';
import { useRollupOutput } from '../stores/rollupOutput';
import ReplInput from './ReplInput.vue';
import ReplOutput from './ReplOutput.vue';

const rollupOutputStore = useRollupOutput();

useUpdateStoresFromQuery();
useSyncQueryWithStores();

onMounted(() => {
	document
		.querySelector('meta[name="viewport"]')
		?.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1');
});

onUnmounted(() => {
	document
		.querySelector('meta[name="viewport"]')
		?.setAttribute('content', 'width=device-width,initial-scale=1');
});
</script>

<style scoped>
button {
	font-family: inherit;
	font-size: inherit;
	border: none;
	outline: none;
	cursor: pointer;
	padding: 0 1rem;
	line-height: 2.25rem;
	white-space: nowrap;
}

button:disabled {
	cursor: default;
}

.icon {
	font-size: 0.8em;
}

input {
	display: block;
	width: 100%;
	font-family: inherit;
	font-size: inherit;
	padding: 0.5em;
	border: none;
	outline: none;
	line-height: 1;
}

@font-face {
	font-family: 'fontello';
	src: url('../font/fontello.eot?58001839');
	src: url('../font/fontello.eot?58001839#iefix') format('embedded-opentype'),
		url('../font/fontello.woff?58001839') format('woff'),
		url('../font/fontello.ttf?58001839') format('truetype'),
		url('../font/fontello.svg?58001839#fontello') format('svg');
	font-weight: normal;
	font-style: normal;
}

[class^='icon-']:before,
[class*=' icon-']:before {
	font-family: 'fontello';
	font-style: normal;
	font-weight: normal;
	speak: none;

	display: inline-block;
	text-decoration: inherit;
	width: 1em;
	margin-right: 0.2em;
	text-align: center;
	/* opacity: .8; */

	/* For safety - reset parent styles, that can break glyph codes*/
	font-variant: normal;
	text-transform: none;

	/* fix buttons height, for twitter bootstrap */
	line-height: 1em;

	/* Animation center compensation - margins should be symmetric */
	/* remove if not needed */
	margin-left: 0.2em;

	/* you can be more comfortable with increased icons size */
	/* font-size: 120%; */

	/* Font smoothing. That was taken from TWBS */
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	/* Uncomment for 3D effect */
	/* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */
}

.icon-pencil:before {
	content: '\e800';
} /* '' */
.icon-cancel:before {
	content: '\e801';
} /* '' */
.icon-plus:before {
	content: '\e802';
} /* '' */
.icon-minus:before {
	content: '\e803';
} /* '' */
.icon-ok:before {
	content: '\e804';
} /* '' */
.icon-error:before {
	content: '\e805';
} /* '' */
.icon-attention:before {
	content: '\e806';
} /* '' */
</style>

<style scoped>
h2 {
	white-space: nowrap;
	margin-bottom: 0.25rem;
	font-size: 20px;
	line-height: 28px;
	font-weight: 600;
	letter-spacing: -0.01em;
}

.repl {
	height: calc(100% - 3.6em);
	--warning-color: #181818;
	--warning-background: #eed245;
	--error-color: white;
	--error-background: #e94c43;
}

.left,
.right {
	width: 100%;
	padding: 1rem;
}

@media (min-width: 45rem) {
	.left,
	.right {
		width: 50%;
		height: 100%;
		float: left;
		overflow-y: auto;
	}
}
</style>
