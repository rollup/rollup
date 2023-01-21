import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCurrentSection = defineStore('currentSection', () => {
	const section = ref<string | null>(null);
	return {
		section,
		set(value: string) {
			section.value = value;
		}
	};
});
