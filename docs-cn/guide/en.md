Resolving legacy link…

<script setup lang="ts">
import { useRouter } from "vitepress"; 

if (typeof window !== "undefined") {
  const { go } = useRouter();
  go(`/guide/en/${location.hash}`);
}
</script>
