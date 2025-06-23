import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { prisma } from "../prisma/client.js";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
// import {Qdran} from "qdrant-client"

import { StateGraph, Annotation } from "@langchain/langgraph";
import { TavilySearch } from "@langchain/tavily";

// const StateAnnotation = Annotation.Root({
//   properties,
//   telementry,

// })

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0
});

// const googlePlaceTool = tool(new GooglePlacesAPI())
const tavily = new TavilySearch({
  maxResults: 1,
  includeAnswer: true,
  tavilyApiKey: process.env.TAVILY_API_KEY
});

export async function RecommendationAgent({ query, userId }) {
  console.log("I am here")
  const prompt = new ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an AI powered Recommendation System, that considers the User's query and telementry to make personalized property recommendations." +
        " You are also expected to act as a semantic search tool, from the list of properties returned to you by the user, you would choose those that are closely similar to the user's query" +
        " Use the provided tools to progress use the tools provided to curate a personalized list for the user." +
        " Properties with similar features within close proximity to the user's location or the location choosen by the user should rank higher" +
        " The recommendation system should also include recommendation based on close proximity to the users query or filters." +
        " "
    ]
  ]);

  const telementryFetchTool = tool(
    async () => {
      try {
        console.log("Getting User's telementry");
        const telementry = await prisma.telementry.findMany({
          where: {
            userId: userId
          },
          includes: {
            user: true
          }
        });
        return { telementry };
      } catch (error) {
        return { error: ["Unable to find Telementry"] };
      }
    },
    {
      name: "Telementry Retrieval Tool",
      description:
        "This tool is used to fetch user's telementry that the llm would use to work to recommend properties.",
      schema: z.object({
        userId: z
          .string()
          .describe(
            "This is the user id that is used to fetch the user's telementries from the prisma database"
          )
      })
    }
  );

  const propertyFetchTool = tool(
    async ({ userId }) => {
      try {
        console.log("Calling the property fetch tool");
        const properties = await prisma.property.findMany({});
        return { properties };
      } catch (error) {
        return { error: ["Unable to find Properties"] };
      }
    },
    {
      name: "Property Fetch Tool",
      description:
        "This tool is used to fetch the properties that the llm would recommend properties from."
    }
  );

  const agent = createReactAgent({
    llm,
    prompt,
    tools: [propertyFetchTool, telementryFetchTool, tavily]
  });

  const result = await agent.invoke({
    messages: [new HumanMessage(query)]
  });

  return result
}
