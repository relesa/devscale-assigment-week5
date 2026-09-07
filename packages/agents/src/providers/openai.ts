import type {
	CompletionRequest,
	StreamingCompletionModel,
} from "@anvia/core/completion";
import { OpenAIClient } from "@anvia/openai";

function optionalEnv(name: string) {
	const value = process.env[name]?.trim();
	return value === "" ? undefined : value;
}

function completionApi(name: string, fallback: "responses" | "chat") {
	return optionalEnv(name) === "chat" ? "chat" : fallback;
}

function withoutTemperature<ModelName extends string>(
	model: StreamingCompletionModel<unknown, ModelName>,
): StreamingCompletionModel<unknown, ModelName> {
	const stripTemperature = (
		request: CompletionRequest<ModelName>,
	): CompletionRequest<ModelName> => {
		const { temperature: _temperature, ...rest } = request;
		return rest;
	};

	return {
		provider: model.provider,
		defaultModel: model.defaultModel,
		capabilities: model.capabilities,
		getModelInfo: model.getModelInfo?.bind(model),
		traceRequest: model.traceRequest?.bind(model),
		completion: (request) => model.completion(stripTemperature(request)),
		streamCompletion: (request) => model.streamCompletion(stripTemperature(request)),
	};
}

const openai = new OpenAIClient({
	apiKey: process.env.OPENAI_API_KEY,
	baseUrl: optionalEnv("OPENAI_BASE_URL"),
	completionApi: completionApi("OPENAI_COMPLETION_API", "chat"),
});

const judgeOpenai = new OpenAIClient({
	apiKey: process.env.OPENAI_API_KEY,
	baseUrl: optionalEnv("OPENAI_BASE_URL"),
	completionApi: completionApi("OPENAI_JUDGE_COMPLETION_API", "responses"),
});

export const defaultModel = openai.completionModel(
	process.env.OPENAI_MODEL ?? "gpt-5-mini",
);

export const judgeModel = withoutTemperature(
	judgeOpenai.completionModel(
		process.env.OPENAI_JUDGE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5-mini",
	),
);
