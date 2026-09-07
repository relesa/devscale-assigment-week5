import { readFile } from "node:fs/promises";
import { embedDocuments } from "@anvia/core/embeddings";
import { QdrantVectorStore } from "@anvia/qdrant";
import { createTransformersEmbeddingModel } from "@anvia/transformers";

const handbookPath = new URL(
	"../../../../documents/devscale-employee-handbook.md",
	import.meta.url,
);

const markdown = await readFile(handbookPath, "utf8");
const sections = markdown
	.split(/\n(?=## )/)
	.map((section) => section.trim())
	.filter(Boolean);

console.log(`Embedding ${sections.length} handbook sections...`);

const model = await createTransformersEmbeddingModel();
const documents = await embedDocuments(model, sections, {
	id: (_, index) => `devscale-employee-handbook-${index + 1}`,
	content: (section) => section,
	metadata: (_, index) => ({
		source: "devscale-employee-handbook.md",
		section: index + 1,
	}),
});

const store = await QdrantVectorStore.connect({
	collectionName: "devscale_employee_handbook",
	vectorSize: 384,
});

await store.upsertDocuments(documents);

console.log(
	`Inserted ${documents.length} sections into devscale_employee_handbook.`,
);
