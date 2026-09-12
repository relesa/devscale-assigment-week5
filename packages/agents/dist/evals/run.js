import { answerRelevancy, contains, exactMatch, faithfulness, gEval, runEvalCli, } from "@anvia/core/evals";
import { createAgent, flushAgentTracing } from "../agent.js";
import { judgeModel } from "../providers/openai.js";
import { cases } from "./cases.js";
import { lensEval } from "./lens.js";
const agent = createAgent({
    agentId: "employee-handbook-eval",
    additionalInstructions: [
        "For eval runs, answer only the requested fact in a concise sentence. Do not add source labels, next steps, offers to search elsewhere, or fictional-training disclaimers unless the user explicitly asks whether the handbook is official or legally binding. If the handbook does not contain the answer, say that directly.",
    ],
});
async function runAgent(input) {
    const response = await agent.prompt(input).withCompletionRetries().send();
    return response.output;
}
function casesFor(metric) {
    return cases.filter((testCase) => testCase.metadata.metric === metric);
}
await runEvalCli({
    name: "employee-handbook-relevancy",
    cases: casesFor("relevancy"),
    target: runAgent,
    metrics: [answerRelevancy({ model: judgeModel, threshold: 0.8 })],
    concurrency: 1,
    reporters: [lensEval.reporter],
});
await runEvalCli({
    name: "employee-handbook-faithfulness",
    cases: casesFor("faithfulness"),
    target: runAgent,
    metrics: [faithfulness({ model: judgeModel, threshold: 0.8 })],
    concurrency: 1,
    reporters: [lensEval.reporter],
});
await runEvalCli({
    name: "employee-handbook-g-eval",
    cases: casesFor("gEval"),
    target: runAgent,
    metrics: [
        gEval({
            name: "answer-quality",
            model: judgeModel,
            threshold: 0.8,
            evaluationParams: ["input", "actualOutput", "expectedOutput"],
            criteria: "The answer is correct, directly addresses the question, and follows the expected answer without inventing policy.",
        }),
    ],
    concurrency: 1,
    reporters: [lensEval.reporter],
});
await runEvalCli({
    name: "employee-handbook-contains",
    cases: casesFor("contains"),
    target: runAgent,
    metrics: [contains()],
    concurrency: 1,
    reporters: [lensEval.reporter],
});
await runEvalCli({
    name: "employee-handbook-exact-match",
    cases: casesFor("exactMatch"),
    target: runAgent,
    metrics: [exactMatch()],
    concurrency: 1,
    reporters: [lensEval.reporter],
});
await flushAgentTracing();
process.exit(0);
