"use client"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, Bot, CandlestickChart, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { apiRequest } from "@/lib/api-client"
import { useAssetStore, useSessionState, useTradeStore } from "@/store/useStore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TradeBody, TradeResponse } from "@/types/type"


type Message = {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "decision" | "error" | "follow-up" | "strategy" | "message"
  data?: unknown
}

type AuthResponse = {
  success: boolean
  userId: string
}

export default function Chat() {
  const addTrade = useTradeStore((state) => state.addTrade)

const selectedSymbol = useAssetStore((state) => state.selectedSymbol)
const price = useAssetStore((state) =>  selectedSymbol ? state.livePrices[selectedSymbol] : null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      text: "Hello! How can I help you with trading today?",
      sender: "ai",
      timestamp: new Date(),
      type: "message",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  // Fetch userId from /auth/me on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await apiRequest<AuthResponse>("/auth/me", "GET")
        if (response.success && response.userId) {
          setUserId(response.userId)
        }
      } catch (err) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "Failed to authenticate. Please log in again.",
          sender: "ai",
          timestamp: new Date(),
          type: "error",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }
    fetchUserId()
  }, [])
  
  // Initialize WebSocket connection once userId is available
  useEffect(() => {
    if (!userId) return
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_CHAT_URL}?userId=${userId}`
      const ws = new WebSocket(wsUrl)
      ws.onopen = () => { }
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          let messageText: string | any[] = ""
          let messageType = "message"
          let messageData: unknown = null
          if (typeof parsed.message === "string") {
            try {
              const nestedParse = JSON.parse(parsed.message)
              if (Array.isArray(nestedParse.message)) {
                messageText = nestedParse.message
                messageType = nestedParse.type || "message"
                messageData = nestedParse.message
              } else {
                messageText = nestedParse.message || ""
                messageType = nestedParse.type || "message"
                messageData = nestedParse
              }
            } catch (e) {
              messageText = parsed.message
              messageType = parsed.type || "message"
            }
          } else if (Array.isArray(parsed.message)) {
            messageText = parsed.message
            messageType = parsed.type || "message"
            messageData = parsed.message
          } else {
            messageText = parsed.message || ""
            messageType = parsed.type || "message"
          }
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: "ai",
            timestamp: new Date(),
            type: messageType as any,
            data: messageData,
          }
          setMessages((prev) => [...prev, aiMessage])
          setIsLoading(false)
        } catch (err) {
          setIsLoading(false)
        }
      }
      ws.onerror = () => {
        setIsLoading(false)
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "Connection error. Please try again.",
          sender: "ai",
          timestamp: new Date(),
          type: "error",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
      ws.onclose = () => { }
      wsRef.current = ws
      return () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close()
        }
      }
    } catch (err) { }
  }, [userId])
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  const handleSendMessage = async () => {
    if (!input.trim() || !userId) return
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
      type: "message",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    try {
      await apiRequest(
        "/trade/ask-agent",
        "POST",
        {
          humanMessage: input,
        }
      )
    } catch (err) {
      setIsLoading(false)
      const errorMessage: Message = {
        id: Date.now().toString(),
        text:
        err instanceof Error
        ? err.message
        : "Failed to send message. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        type: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const handleShowChat = () => {
    setShowSpinner(true)
    setTimeout(() => {
      setShowSpinner(false)
      setShowChat(true)
    }, 500)
  }
  
  const handleExecuteOrder = async (order: any) => {
    try {
      if (!order.directOrder) {
        await apiRequest(
          "/trade/execute",
          "POST",
          {
            asset: order.asset ?? "ETH_USDC",
            margin: Math.trunc(Number(order.margin) * 1e2),
            leverage: Number(order.leverage),
            slippage: 1,
            type: (order.action).toLowerCase(),
            indicator: order.indicator,
            value: order.value,
            condition:order.condition,
          }
        )
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Order executed successfully!",
            sender: "ai",
            timestamp: new Date(),
            type: "info",
          },
        ])
      } else {
        await apiRequest<TradeResponse,TradeBody>(
          "/trade/create",
          "POST",
          {
            asset: order.asset ?? "ETH_USDC",
            margin: Math.trunc(Number(order.margin) * 1e2),
            leverage: Number(order.leverage),
            slippage: 1,
            type: (order.action).toLowerCase(),
          }
        )
        // const data = await res 
    // addTrade({
    //       orderId: data.orderId,
    //       asset: order.asset ?? " ",
    //       margin: order.margin,
    //       leverage: order.leverage,
    //       slippage:1,
    //       type: (order.action).toLowerCase(),
    //       openingPrice: (price?.ask)?.toString() ?? " "
    //     })
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Order placed successfully!",
            sender: "ai",
            timestamp: new Date(),
            type: "info",
          },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Failed to execute order.",
          sender: "ai",
          timestamp: new Date(),
          type: "error",
        },
      ])
    }
  }

  const renderMessageContent = (message: Message) => {
    // console.log("message type", message.type)
    // console.log("cha hai cha ", message)

    // Handle array of objects in message.text
    if (Array.isArray(message.text)) {
      return (
        <div className="space-y-2">
          {message.text.map((item: any, idx: number) => (
            <div key={idx}>
              {item.type === "text" && (
                <p className="text-sm whitespace-pre-wrap">{item.text}</p>
              )}
              {item.type === "code" && (
                <pre className="text-xs bg-background/50 p-2 rounded overflow-auto">
                  {item.text}
                </pre>
              )}
              {item.type === "json" && (
                <pre className="text-xs bg-background/50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(item.text, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )
    }

    // Handle string message.text
    if (typeof message.text === "string") {
      switch (message.type) {
        case "decision":
          let msgObj: any = null
          try {
            msgObj = JSON.parse(message.data?.data)
          } catch (e) {
            // fallback: show as text
            console.log("error while parsing decision", e)
          }

          return (
            <div className="space-y-2 w-full ">
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {msgObj && typeof msgObj === "object" ? (
                <div className="my-2">
                  <Table className="rounded border bg-background text-xs">
                    <TableHeader>
                      <TableRow>
                        {/* <TableHead className="px-5">Field</TableHead>
                        <TableHead className="px-5">Value</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(msgObj).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-semibold px-5">{key.toUpperCase()}</TableCell>
                          <TableCell className="px-5">{String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleExecuteOrder(msgObj)}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ) : (
                message.data && (
                  <pre className="text-xs bg-background/50 p-2 rounded">
                    dicision-xyz:
                    {JSON.stringify(message.data, null, 2)}
                  </pre>
                )
              )}
            </div>
          )
        case "follow-up":
          return (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap font-semibold">
                {message.text}
              </p>
            </div>
          )
        case "error":
          return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        default:
          return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      }
    }

    return <p className="text-sm">Unable to render message</p>
  }

  return (
    <Card className="h-full max-h-[650px] lg:max-h-[650px] w-full rounded-none border-0 bg-card text-card-foreground flex flex-col items-center justify-center">
      {!showChat ? (
        <div className="flex flex-col items-center justify-center h-full w-full gap-6">
          <div className="flex flex-col items-center gap-2">
            <CandlestickChart className="w-16 h-16 text-green-700" />
            <CardTitle className=" font-semibold text-center text-sm">
              AI Strategy Generator
            </CardTitle>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Let our AI help you create automated trading strategies for BTC, ETH,
              SOL and more.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg text-base font-medium shadow"
            onClick={handleShowChat}
          >
          {showSpinner && (
            <div className="">
              <Spinner className="text-gray" />
            </div>
          )}
          <p className="text-xs">

            Generate Strategy with AI
          </p>
          </Button>

        </div>
      ) : (
        <>
          <CardHeader className="p-2 border-b flex-shrink-0 w-full ">
            <div className="flex items-center gap-2">
              <ChevronLeft className="mr-4 w-6 cursor-pointer" onClick={()=>{
                setShowChat(false);
              }}/>
              <Bot className="w-5 h-5 text-green-700" />
              <CardTitle className="text-sm font-semibold">Flux-bot</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col min-h-0 w-full">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto h-[400px] min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.type === "error"
                            ? "bg-red-900/30 text-red-200"
                            : message.type === "strategy"
                              ? "bg-green-900/30 text-green-200"
                              : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </div>
            {/* Input Area */}
            <div className="border-t p-3 bg-card flex-shrink-0 w-full">
              <div className="flex gap-2">
                <Input
                  placeholder={userId ? "eg: buy btc when it goes down by 2%" : "Loading..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || !userId}
                  className="text-sm h-9"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim() || !userId}
                  className="h-9 w-9 p-0 bg-green-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}