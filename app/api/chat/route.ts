import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messages }: { messages: UIMessage[] } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error("[Chat API] Invalid messages format:", messages);
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    

    // Get the user's session - userId will be null if not authenticated
    const { userId } = await auth();
    console.log("[Chat API] User ID:", userId || "not authenticated");

    // Create agent with user context (orders tool only available if authenticated)
    const agent = createShoppingAgent({ userId });
    console.log("[Chat API] Agent created successfully");

    const response = createAgentUIStreamResponse({
      agent,
      messages,
    });

    console.log("[Chat API] Response created, streaming to client");
    return response;
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
