import { useEffect, useState, useCallback, useRef } from "react";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

export function useWebsocket<T>(endpoint: string) {
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Cannot connect without auth

      const url = `${WS_BASE_URL}${endpoint}?token=${token}`;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log(`Connected to WS: ${endpoint}`);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error("Failed to parse WS message", error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log(`Disconnected from WS: ${endpoint}. Reconnecting in 5s...`);
        // Basic auto-reconnect
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error("WS error:", error);
        ws.current?.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [endpoint]);

  return { lastMessage, isConnected };
}
