import { QdrantVectorStore } from "@anvia/qdrant";
import { createTransformersEmbeddingModel } from "@anvia/transformers";

const model = await createTransformersEmbeddingModel();
const store = await QdrantVectorStore.connect<string>({
	collectionName: "devscale_employee_handbook",
	vectorSize: 384,
});

export const handbookSearch = store.index(model).asTool({
	name: "handbookSearch",
	description: "Search the Devscale employee handbook for relevant information",
	topK: 5,
});
