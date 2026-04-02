"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { Loader, Send } from "lucide-react"
import React, { useEffect, useState, Suspense } from "react"
import { v4 as uuidv4 } from 'uuid';
import EmptyBoxState from "./EmptyBoxState"
import GroupSizeUi from "./GroupSizeUi"
import BudgetUi from "./BudgetUi"
import SelectDays from "./SelectDays"
import FinalUi from "./FinalUi"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUserDetail } from "@/app/provider"
import { useTripDetail } from "@/app/provider"
import { useSearchParams } from "next/navigation"

type Message = {
  role: "user" | "assistant"
  content: string
  ui?: string | null
}

export type Hotel = {
  hotel_name: string;
  hotel_address: string;
  price_per_night: string;
  hotel_image_url: string;
  geo_coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  description: string;
};

export type TripInfo = {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  hotels: Hotel[];
  itinerary: itinerary[];
};

export type Activity = {
  place_name: string;
  place_details: string;
  place_image_url: string;
  geo_coordinates: {
    latitude: number;
    longitude: number;
  };
  place_address: string;
  ticket_pricing: string;
  time_travel_each_location: string;
  best_time_to_visit: string;
};

export type itinerary = {
  day: number;
  day_plan: string;
  best_time_to_visit_day: string;
  activities: Activity[];
};


export default function ChatBox() {
  return (
    <Suspense fallback={<div className='h-[85vh] flex items-center justify-center border shadow rounded-2xl'><Loader className='animate-spin' /></div>}>
      <ChatBoxContent />
    </Suspense>
  )
}

function ChatBoxContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUiType, setLastUiType] = useState<string | null>(null);
  const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail)
  const { userDetail, setUserDetail } = useUserDetail();
  const { tripDetailInfo, setTripDetailInfo } = useTripDetail();

  const searchParams = useSearchParams();

  // Read query parameter on mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      onSend(query);
    }
  }, [searchParams]);

  // 🔑 SINGLE send function
  const onSend = async (inputValue?: string) => {
    const textToSendMessage = inputValue || userInput;
    if (!textToSendMessage?.trim() || loading || isProcessing) return;

    setLoading(true);
    setUserInput('');

    const newMsg: Message = {
      role: 'user',
      content: textToSendMessage
    }

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    try {
      const result = await axios.post('/api/aimodel', {
        messages: updatedMessages,
        isFinal: isFinal
      });

      console.log("TRIP", result.data);

      // If we got a UI response, check if it's the same as last time to avoid duplicates
      if (result?.data?.ui && lastUiType === result.data.ui && result.data.ui !== 'final') {
        // Skip adding duplicate UI message
        console.log("Skipping duplicate UI:", result.data.ui);
      } else if (!isFinal) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: result?.data?.resp || "Please continue...",
          ui: result?.data?.ui || null
        };

        setMessages(prev => [...prev, assistantMsg]);

        // Update last UI type
        if (result?.data?.ui) {
          setLastUiType(result.data.ui);

          if (result.data.ui === 'final') {
            setIsFinal(true);
          }
        }
      } else if (isFinal && result?.data?.trip_plan) {
        // Handle trip plan generation
        const tripData = result.data.trip_plan;
        setTripDetailInfo(tripData);
        setIsFinal(false);
        setLastUiType(null);

        const tripId = uuidv4();
        await SaveTripDetail({
          tripDetail: tripData,
          tripId: tripId,
          uid: userDetail?.id,
        });

        // Add final success message - UI set to null to avoid redundant View Trip button
        const successMsg: Message = {
          role: 'assistant',
          content: "✅ Your trip plan is ready! Check it out on the right.",
          ui: null
        };

        setMessages(prev => [...prev, successMsg]);
      } else if (isFinal && !result?.data?.trip_plan) {
        // Handle case where trip plan wasn't generated
        const errorMsg: Message = {
          role: 'assistant',
          content: "I need more information to generate your trip. Could you please tell me your travel interests? (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation)",
          ui: null
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsFinal(false);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        ui: null
      }]);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }

  // Enhanced UI renderer
  const renderGenerativeUi = (ui: string, disabled: boolean = false) => {
    const handleUISelection = (value: string) => {
      // Add context to the selection to help the AI understand
      let formattedValue = value;

      if (ui === 'groupSize') {
        formattedValue = `Group size: ${value}`;
      } else if (ui === 'budget') {
        formattedValue = `Budget: ${value}`;
      } else if (ui === 'tripDuration') {
        formattedValue = `Duration: ${value} days`;
      }

      onSend(formattedValue);
    };

    // Special handler for final UI
    const handleFinalAction = () => {
      // Add "Ok, Great!" message
      const okMsg: Message = {
        role: 'user',
        content: "Ok, Great!"
      };
      setMessages(prev => [...prev, okMsg]);

      // If trip is NOT already generated, trigger generation
      if (!tripDetailInfo) {
        setIsProcessing(true);

        // Call onSend with the actual generation trigger
        setTimeout(() => {
          onSend("Generate my complete trip plan with itinerary, hotels, and activities.");
        }, 100);
      }
    };

    switch (ui) {
      case 'groupSize':
        return <GroupSizeUi
          onSelectOption={handleUISelection}
          disabled={disabled}
        />;
      case 'budget':
        return <BudgetUi
          onSelectOption={handleUISelection}
          disabled={disabled}
        />;
      case 'tripDuration':
        return <SelectDays
          onSelectOption={handleUISelection}
          disabled={disabled}
        />;
      case 'final':
        return <FinalUi
          viewTrip={handleFinalAction}
          disabled={disabled}
        />;
      default:
        return null;
    }
  };

  // Keep the exact same return block as provided
  return (
    <div className='h-[85vh] flex flex-col border shadow rounded-2xl'>
      {messages?.length == 0 &&
        <EmptyBoxState
          onSelectOption={(v: string) => onSend(v)} />
      }
      {/* Display Messages */}
      <section className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((msg: Message, index) => {
          // Find the last assistant message with a UI tag
          const lastAssistantWithUiIndex = [...messages]
            .map((m, i) => (m.role === 'assistant' && m.ui ? i : -1))
            .reduce((max, curr) => Math.max(max, curr), -1);

          // Only keep the VERY LAST UI active, others disabled
          const isLatestRelevantUi = index === lastAssistantWithUiIndex;

          // Exception for final UI - if it's there, keep it but maybe disable if trip generated
          const shouldDisableUi = !isLatestRelevantUi && msg.ui !== 'final';

          return msg.role == 'user' ?
            <div className='flex justify-end m-2' key={index}>
              <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>
                {msg.content}
              </div>
            </div> :
            <div className='flex justify-start m-2' key={index}>
              <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg w-full'>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.ui && (
                  <div className="mt-3">
                    {renderGenerativeUi(msg.ui, shouldDisableUi)}
                  </div>
                )}
              </div>
            </div>
        })}
        {loading &&
          <div className='flex justify-start m-2'>
            <div className='bg-gray-100 text-black px-4 py-2 rounded-lg'>
              <Loader className='animate-spin' />
            </div>
          </div>
        }
      </section>
      {/* User Input */}
      <section >
        <div className='border rounded-2xl p-4 relative'>
          <Textarea placeholder='Start typing here...'
            className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
            onChange={(event) => setUserInput(event.target.value)}
            value={userInput}
          />
          <Button size={'icon'} className='absolute bottom-6 right-6' onClick={() => onSend()}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </section>
    </div >
  )
}