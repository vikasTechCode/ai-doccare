import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@shared/schema";

interface ChatMessageDisplay {
  id: number;
  message: string;
  response: string;
  createdAt: Date | null;
  isUser?: boolean;
}

export function AIHealthAssistant() {
  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory = [], refetch } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", user?.id],
    enabled: !!user,
  });

  
const [newMessages, setNewMessages] = useState<ChatMessageDisplay[]>([]);

const sendMessageMutation = useMutation({
  mutationFn: async (message: string) => {
    const response = await apiRequest("POST", "/api/chat", {
      message,
      userId: user?.id,
    });
    return { data: await response.json(), message };
  },
  onSuccess: ({ data, message }) => {
    const now = new Date();

    setNewMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        message,
        response: "",
        createdAt: now,
        isUser: true,
      },
      {
        id: Date.now() + 1,
        message: "",
        response: data.response,
        createdAt: now,
        isUser: false,
      },
    ]);

    setCurrentMessage("");
    refetch();
  },
});


  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    sendMessageMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory, sendMessageMutation.isPending]);

  
  // Format messages for display
  const displayMessages: ChatMessageDisplay[] = [];

  chatHistory.forEach((msg) => {
    displayMessages.push({
      id: msg.id * 2 - 1,
      message: msg.message,
      response: "",
      createdAt: msg.createdAt,
      isUser: true,
    });

    displayMessages.push({
      id: msg.id * 2,
      message: "",
      response: msg.response,
      createdAt: msg.createdAt,
      isUser: false,
    });
  });

  // Add newly received messages once, after chat history
  displayMessages.push(...newMessages);


  
return (
  <Card className="relative flex h-[480px] min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <CardHeader className="shrink-0 border-b pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <CardTitle className="text-lg">AI Health Assistant</CardTitle>
      </div>
    </CardHeader>

    <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      <ScrollArea
        className="h-0 min-h-0 min-w-0 flex-1"
        ref={scrollAreaRef}
      >
        <div className="flex min-w-0 flex-col gap-3 pr-3">
          {displayMessages.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              <Bot className="mx-auto mb-2 h-8 w-8 text-slate-400" />
              <p>Hello! I'm your AI health assistant.</p>
              <p className="text-sm">
                Ask me any health-related questions!
              </p>
            </div>
          )}

          {displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full min-w-0 ${
                msg.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`min-w-0 max-w-[85%] rounded-lg p-3 break-words sm:max-w-[75%] ${
                  msg.isUser
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-900"
                }`}
              >
                <div className="flex min-w-0 items-start gap-2">
                  {!msg.isUser && (
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  )}

                  <p className="min-w-0 whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
                    {msg.isUser ? msg.message : msg.response}
                  </p>

                  {msg.isUser && (
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-blue-100" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" />
                <p className="text-sm text-slate-500">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex w-full shrink-0 items-center gap-2 border-t pt-3">
        <Input
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask your health question..."
          disabled={sendMessageMutation.isPending}
          className="min-w-0 flex-1 text-sm"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!currentMessage.trim() || sendMessageMutation.isPending}
          size="icon"
          className="shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
}