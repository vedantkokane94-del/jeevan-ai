import { Env } from "./types";
import { handleTwilioWebSocket } from "./websocket";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Twilio Webhook: When the phone rings
    if (url.pathname === "/twilio/incoming" && request.method === "POST") {
      const host = request.headers.get("host") || url.host;
      // Tell Twilio to open a WebSocket stream back to us
      const twiml = `
        <Response>
          <Connect>
            <Stream url="wss://${host}/ws/twilio" />
          </Connect>
        </Response>
      `;
      return new Response(twiml, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // 2. Twilio Media Stream WebSocket
    if (url.pathname === "/ws/twilio") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      // Create a WebSocket pair
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Handle the server side of the connection
      ctx.waitUntil(handleTwilioWebSocket(server, env));

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("JEEVAN AI Edge Voice Server Running", { status: 200 });
  },
};
