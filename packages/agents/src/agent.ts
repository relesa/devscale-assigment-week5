import {
	AgentBuilder,
	type AnyTool,
	type CompletionModel,
	type MemoryStore,
} from "@anvia/core";
import { lens } from "@anvia/lens";
import { createLoggerObserver, createPinoLogger } from "@anvia/logger";
import { BASE_INSTRUCTIONS } from "./prompts/base-instructions.js";
import { defaultModel } from "./providers/openai.js";
import { handbookSearch } from "./tools/handbook-search.js";
import { createWebTools } from "./tools/web-search.js";

const tracing = lens.createFromEnv({
	optional: true,
	serviceName: "rag-agent",
	captureMode: "full",
});

const logger = createPinoLogger({
	name: "rag-agent",
	level: "info",
	pinoOptions: {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: process.stdout.isTTY,
				translateTime: "SYS:standard",
			},
		},
	},
});

const logging = createLoggerObserver(logger);

export function flushAgentTracing() {
	return tracing.flush();
}

interface CreateAgentOptions {
	agentId: string;
	model?: CompletionModel;
	additionalTools?: AnyTool[];
	additionalInstructions?: string[];
	memory?: MemoryStore;
}

export function createAgent(opts: CreateAgentOptions) {
	const agent = new AgentBuilder(opts.agentId, opts.model ?? defaultModel)
		.instructions(BASE_INSTRUCTIONS)
		.tools([
			...createWebTools(),
			handbookSearch,
			...(opts.additionalTools ?? []),
		])
		.defaultMaxTurns(50)
		.observe(logging)
		.observe(tracing);

	for (const instruction of opts.additionalInstructions ?? []) {
		agent.instructions(instruction);
	}

	if (opts.memory) {
		agent.memory(opts.memory);
	}

	return agent.build();
}
