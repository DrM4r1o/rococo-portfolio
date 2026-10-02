// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	integrations: [mdx()],
    site: 'https://marioesparzaperez.es',
	adapter: cloudflare({ imageService: 'compile' }),
	vite: {
		plugins: [tailwindcss()],
	},
});
