import { type AnyTool, type CompletionModel, type MemoryStore } from "@anvia/core";
export declare function flushAgentTracing(): void | Promise<void>;
interface CreateAgentOptions {
    agentId: string;
    model?: CompletionModel;
    additionalTools?: AnyTool[];
    additionalInstructions?: string[];
    memory?: MemoryStore;
}
export declare function createAgent(opts: CreateAgentOptions): import("@anvia/core/agent").Agent<CompletionModel<unknown, string>>;
export {};
