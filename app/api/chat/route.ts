import { NextRequest } from "next/server";
import { agentResponder } from "@/lib/agent";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    return await agentResponder(request);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        reply: "Our concierge had trouble responding just now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
