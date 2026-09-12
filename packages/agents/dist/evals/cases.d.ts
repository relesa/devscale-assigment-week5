import type { EvalCase } from "@anvia/core/evals";
export type CaseCategory = "common" | "edge" | "toolCall" | "abstention" | "guardrail";
export type MetricName = "relevancy" | "faithfulness" | "gEval" | "contains" | "exactMatch";
export type HandbookEvalCase = EvalCase<string, string> & {
    metadata: {
        category: CaseCategory;
        metric: MetricName;
    };
};
export declare const cases: HandbookEvalCase[];
