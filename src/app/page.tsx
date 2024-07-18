"use client";

import { useEffect, useState } from "react";
import { socket } from "@/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport: any) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onMessage(message: string) {
      console.log("Received message:", message); // Add this line
      setMessages((prevMessages) => [...prevMessages, message]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      console.log("Sending message:", input); // Add this line
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <div className="w-full max-w-md p-4 border rounded">
        <div className="h-64 overflow-y-scroll border-b mb-4">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={sendMessage}
            className="p-2 border rounded-r bg-blue-500 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
