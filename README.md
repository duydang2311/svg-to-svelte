# svg-to-svelte

I use `unplugin-icons` most of the time, but not when it comes to dynamic icon. This is a helper to convert SVG to Svelte component and the ability to import them dynamically in any bundler like Vite. With the generated components and types, Vite should be happy to resolve the dynamic imports.

## Usage

1. Put your SVG files in `src/icons/`.

2. Build.
```bash
pnpm run build

# or npm run build
```

3. Import and use.

```svelte
<script>
	import { Backpack, type IconName } from 'svelte-custom-icons';
	let name: IconName = 'Glasses';
</script>

<Backpack class="w-8 h-8 text-red-500" />

<!-- vite dynamic import -->
<!-- better put this in a component with a name prop -->
{#await import(`../node_modules/svelte-custom-icons/dist/icons/${name}.svelte`) then module}
	<svelte:component this={module.default} class="w-8 h-8 text-red-500" />
{/await}
```
