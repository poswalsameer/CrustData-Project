import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export async function POST(Request: NextRequest){

    if( Request.method !== "POST") {
        return NextResponse.json(
            {message: "Method not allowed"},
            {status: 405}
        )
    }
    
    const { query } = await Request.json();

    if (!query) {
        return NextResponse.json(
            {message: "Please enter the name of a startup"},
            {status: 400}
        )
    }

    try {

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const prompt = `
        You are a customer support agent for an organisation. This organisation has some public APIs which the users can use, you need to help the users with their problems related to the API. 
        
        These are the API Docs of the organisation, the context has to be always from these docs. Help the users by using these docs only and providing examples from these docs only, here are the docs:

        1. https://www.notion.so/crustdata/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48
        2. https://www.notion.so/crustdata/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48

        Try not to cross question the user about anything and stick to these docs in finding the answer to the user query.

        Format everything perfectly in the response.

        If you are returning any code snippet, then return it in markdown format.

        If the user prompts something like "Hello, Hi, how are you", then don't be rude, you can reply to these things.

        Here is the question asked by the user: ${query}

        `;  

        const result = await model.generateContentStream(prompt);

        const readableStream = new ReadableStream({
            async pull(controller) {
              // For each chunk in the stream from Gemini API, push it to the frontend
              for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                controller.enqueue(chunkText);
              }
              controller.close();
            },
        });

        return new NextResponse(readableStream, {
            headers: { "Content-Type": "text/plain" },
        });
    } 
    catch (error) {
        return NextResponse.json(
            {message: "Error while generating content on the entered startup"},
            {status: 500}
        )
    }

}