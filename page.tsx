"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

export default function ChatbotUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedPdfText, setParsedPdfText] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    script.onload = () => {
      // @ts-ignore
      if (window["pdfjsLib"]) {
        // @ts-ignore
        window["pdfjsLib"].GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(), // only user text shown in chat
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Compose input for API: user input + parsed pdf text
    const fullUserMessageForAPI = `${input.trim()}\n\n[PDF Content]:\n${parsedPdfText}`;

    const updatedMessagesForAPI = [
      ...messages,
      { ...newUserMessage, content: fullUserMessageForAPI },
    ];

    try {
      const geminiConversation = updatedMessagesForAPI.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAITYPg_usf3HRo0JGn-pFak4oYrs8ON64",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: geminiConversation,
          }),
        }
      );

      const data = await response.json();
      const aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t understand that.";

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: aiReply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "ai",
          content: "Failed to get a response from the AI.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    setUploadedFileName(file.name);

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result as ArrayBuffer);

      // @ts-ignore
      const pdf = await window["pdfjsLib"].getDocument(typedArray).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(" ") + "\n";
      }

      setParsedPdfText(fullText); // store for API use
      console.log("📄 Parsed PDF Content:\n", fullText);
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="flex flex-col h-[80vh]">
          <h1 className="text-2xl font-bold text-center pt-4 pb-2">MychatBot</h1>
          <h2 className="text-xl font-semibold py-2">Chat with Gemini AI</h2>

          {/* Chat messages */}
          <ScrollArea className="flex-1 overflow-y-auto border rounded-md p-4 bg-white">
            <div ref={containerRef} className="flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    msg.role === "user"
                      ? "bg-blue-100 self-end ml-auto text-right"
                      : "bg-gray-200 self-start mr-auto text-left"
                  )}
                >
                  {msg.content}
                </div>
              ))}

              {isTyping && (
                <div className="bg-gray-200 self-start mr-auto text-left p-3 rounded-lg max-w-[80%] italic text-gray-500">
                  Typing...
                </div>
              )}

              {uploadedFileName && (
                <div className="bg-green-100 text-green-700 p-2 rounded-md max-w-[80%] self-start">
                  ✅ Uploaded: {uploadedFileName}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Upload section */}
          <div className="mt-2">
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </div>

          {/* Input field */}
          <div className="mt-4 flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={isTyping}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
