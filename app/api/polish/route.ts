import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `作为一位富有诗意的作家，请将以下日记片段润色成一段优美、富有情感的散文，字数控制在原内容的1.5倍左右，保持原文的核心事件和情绪：

${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是一位富有诗意的作家，擅长将日常生活的片段转化为优美、富有情感的散文。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const polishedContent =
      completion.choices[0]?.message?.content?.trim() || content;

    return NextResponse.json({ polishedContent });
  } catch (error) {
    console.error("Error polishing content:", error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to polish content. Please try again." },
      { status: 500 }
    );
  }
}

