import { createTool } from "@anvia/core";
import { tavily } from "@tavily/core";
import { z } from "zod";

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export function createWebTools() {
	const webSearch = createTool({
		name: "webSearch",
		description: "Use this when you need to search the internet",
		input: z.object({
			query: z.string().meta({ description: "The query to search" }),
		}),
		execute: ({ query }) => {
			return tavilyClient.search(query, {
				searchDepth: "advanced",
				includeAnswer: true,
				includeRawContent: "markdown",
				includeImages: true,
			});
		},
	});

	const webExtract = createTool({
		name: "webExtract",
		description: "Use this when you need to extract information from a webpage",
		input: z.object({
			url: z.url().meta({ description: "The URL to extract" }),
		}),
		execute: ({ url }) => tavilyClient.extract([url]),
	});

	return [webSearch, webExtract];
}
