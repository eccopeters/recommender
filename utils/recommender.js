import { Pinecone } from "@pinecone-database/pinecone"

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
})

console.log("I AM HERE")
const indexName = "real-estate-recommendation-system"
export async function getIndex() {
  index = await pc.createIndexForModel({
    name: indexName,
    cloud: 'aws',
    region: 'us-east-1',
    embed: {
      model: 'llama-text-embed-v2',
      fieldMap: { text: 'chunk_text' },
    },
    waitUntilReady: true,
  });
  console.log("Index created:", index);
}

getIndex()

export async function insertRecords({ records }) {
  return await pc.index(indexName).upsertRecords(records)
}


export async function searchData({ query }) {
  // Search the dense index
  const results = await index.searchRecords({
    query: {
      topK: 10,
      inputs: { text: query },
    },
  });

  // Print the results
  results.result.hits.forEach(hit => {
    // console.log(`id: ${hit.id}, score: ${hit.score.toFixed(2)}, category: ${hit.fields.category}, text: ${hit.fields.chunk_text}`);
    console.log(hit)
  });

  return results
}

