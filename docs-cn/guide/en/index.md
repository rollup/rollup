Resolving legacy link…

<script setup lang="ts">
import { useRouter } from "vitepress";
import slugs from "./slugs-and-pages-by-legacy-slugs.json";

if (typeof window !== "undefined") {
  const { go } = useRouter();
  const target = slugs[location.hash.slice(1)];
  if (target) {
    const path = `/${target[0]}/`;
    const hash = target[1] ? `#${target[1]}`: "";
    go(`${path}${hash}`);
  } else {
    go("/introduction/");
  }
}
</script>
