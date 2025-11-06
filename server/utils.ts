import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

const openAiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function getEmbedding(text: string): Promise<number[]> {

    const response = await openAiClient.embeddings.create( {
        // To generate vector embedding (with size 1536)
        model: `text-embedding-3-small`,
        input: text,
    });

    console.log("OpenAI text embeding: ", response.data[0].embedding)
    return response.data[0].embedding;
}


export async function getRelevantTopic(prompt: string): Promise<string> {

 
    const response = await openAiClient.chat.completions.create(  {
    messages: [{ content: 'string', role: 'developer' }],
    model: 'gpt-4o',
  },)

}
