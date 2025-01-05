'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BotIcon, SendIcon, UserIcon, PlusCircleIcon, Axis3DIcon } from 'lucide-react'
import axios from 'axios'
import { Textarea } from '@/components/ui/textarea'

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function ChatUI() {
  const [chats, setChats] = useState<string[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const startNewChat = () => {
    const chatId = Date.now().toString()
    setChats(prevChats => [...prevChats, chatId])
    setActiveChat(chatId)
    setMessages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    }

    setMessages(prevMessages => [...prevMessages, newMessage])
    setInput('')

    try {

      const AIResponse = await axios.post(
        "http://localhost:3000/api/chat",
        { query: input }
      )

      if( AIResponse.status === 200 ){
        const AIMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: AIResponse.data,
          role: 'assistant'
        }
        setMessages(prevMessages => [...prevMessages, AIMessage])
      }
      else{
        console.log("error in try part");
      } 

    } 
    catch (error) {
      console.error(error);  
    }

  }

  return (
    <div className="flex h-screen bg-[#171819] text-gray-100">

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.map(message => (
            <div key={message.id} className={`flex items-start space-x-3 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && <BotIcon className="w-6 h-6 mt-1" />}
              <div className={`rounded-md py-2 max-w-[70%] ${message.role === 'user' ? 'px-4 bg-white/20' : 'px-4 bg-white/25'}`}>
                {message.content}
              </div>
              {message.role === 'user' && <UserIcon className="w-6 h-6 mt-1" />}
            </div>
          ))}
        </ScrollArea>
        <Separator />
        <form onSubmit={handleSubmit} className="p-4 flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="h-16 flex-1 bg-white/5 border-white/10 text-white"
          />
          <Button type="submit" className='bg-white/10 hover:bg-white/15'>
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}