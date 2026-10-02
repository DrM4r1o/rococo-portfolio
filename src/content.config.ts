import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		cover: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		year: z.number(),
		role: z.string(),
		stack: z.array(z.string()).default([]),
		url: z.url().optional(),
		repo: z.url().optional(),
		links: z
			.array(
				z.object({
					label: z.string(),
					href: z.url(),
				})
			)
			.default([]),
		featured: z.boolean().default(false),
		pubDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
	}),
});

const origins = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/origins' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().default(0),
		period: z.string().optional(),
		year: z.number().optional(),
		role: z.string().optional(),
		location: z.string().optional(),
		highlights: z.array(z.string()).default([]),
		meta: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, projects, origins };
