import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postCaption, accountHandle, voiceGuidelines } = await req.json();

    if (!postCaption) {
      return NextResponse.json({ error: "Post caption is required" }, { status: 400 });
    }

    // TODO: Check usage limits from database

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are an Instagram engagement expert. Generate a thoughtful, authentic comment for this Instagram post.

Post by: ${accountHandle || "Unknown"}
Caption: ${postCaption}

${voiceGuidelines ? `Voice Guidelines: ${voiceGuidelines}` : ""}

Requirements:
- Be genuine and add value
- 2-3 sentences maximum
- One emoji at the end is OK
- Don't be generic ("Love this!" etc.)
- Reference specific content from the post
- Sound like a real person, not a bot

Generate ONLY the comment text, nothing else.`,
        },
      ],
    });

    const comment = message.content[0].type === "text" 
      ? message.content[0].text 
      : "";

    // TODO: Increment usage count in database

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error generating comment:", error);
    return NextResponse.json(
      { error: "Failed to generate comment" },
      { status: 500 }
    );
  }
}
