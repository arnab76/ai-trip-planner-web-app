
import { aj } from "@/middleware";
import { auth, currentUser } from "@clerk/nextjs/server";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time. Only ask questions about the following details in order, and wait for the user's answer before asking the next:
1. Starting location (source)
2. Destination city or country
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Trip duration (number of days)

Do not ask multiple questions at once.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.

IMPORTANT RULES:
- Always respond in valid JSON format
- Keep responses short and conversational
- Do NOT repeat user's input in your response
- Check the conversation history carefully. If a detail is already provided, move to the NEXT missing detail.
- If all 5 details are provided, set "ui": "final" and generate the plan response.

Response format must be EXACTLY:
{
  "resp": "Your response text here",
  "ui": "groupSize" | "budget" | "tripDuration" | "final" | null
}

UI TAG MAPPING (STRICT):
- Step 3 (Group size) -> MUST use "ui": "groupSize"
- Step 4 (Budget) -> MUST use "ui": "budget"
- Step 5 (Trip duration) -> MUST use "ui": "tripDuration"
- Steps 1, 2 -> "ui": null
- After Step 5 is answered -> MUST use "ui": "final"

NEGATIVE CONSTRAINTS:
- NEVER use "ui": "groupSize" when asking about Budget.
- NEVER use "ui": "budget" when asking about Group Size.
- NEVER ask for Interests or Special Requirements. Stop after Step 5.
`
const FINAL_PROMPT = `Generate Travel Plan with give details, give me Hotels options list with HotelName,
Hotel address, Price, Hotel image url, geo coordinates, rating, description and suggestions itinerary with placeName, Place Details, Place Image URL,
Geo Coordinates, Place address, ticket Pricing, Time trave each of the location, with each day plan with best time to visit in JSON format.
Output Schema:
{
 "trip_plan":{
 "destination": "string",
 "duration": "string",
 "origin": "string",
 "budget": "string",
 "group_size": "string",
 "hotels": [
 {
   "hotel_name": "string",
   "hotel_address": "string",
   "price_per_night": "string",
   "hotel_image_url": "string",
   "geo_coordinates":{
     "latitude": "number",
     "longitude": "number"
   },
   "rating": "number",
   "description": "string"
  }
 ],
 "itinerary":[
  {
    "day": "number",
    "day_plan":"string",
    "best_time_to_visit_day":"string",
    "activities":[
      {
        "place_name":"string",
        "place_details":"string",
        "place_image_url":"string",
        "geo_coordinates":{
          "latitude":"number",
          "longitude":"number"
        },
        "place_address":"string",
        "ticket_pricing":"string",
        "time_travel_each_location":"string",
        "best_time_to_visit":"string"
      }
    ]
   }
  ]
 }
}
`





export async function POST(req: NextRequest) {
  const { messages, isFinal } = await req.json();
  const user = await currentUser();
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: 'monthly' })
  console.log("hasPremiumAccess", hasPremiumAccess)
  const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: isFinal ? 5 : 0 });

  if (decision.reason.isRateLimit() && (decision.reason as any).remaining === 0 && !hasPremiumAccess) {
    return NextResponse.json({
      resp: 'No Free Credit Remaining',
      ui: 'limit'
    })
  }


  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: isFinal ? FINAL_PROMPT : PROMPT
        },
        ...messages
      ],
      response_format: { type: "json_object" }
    });

    console.log("AI Response Raw:", completion.choices[0].message.content);
    const content = completion.choices[0].message.content || "";

    // Robust JSON parsing
    let parsedData;
    try {
      // Find the first '{' and last '}' to extract JSON from potential wrapper text
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonContent = content.substring(firstBrace, lastBrace + 1);
        parsedData = JSON.parse(jsonContent);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Content:", content);
      return NextResponse.json({
        resp: "I'm sorry, I'm having trouble formatting my response. Let's try again.",
        ui: null
      }, { status: 500 });
    }

    return NextResponse.json(parsedData);
  }
  catch (e) {
    console.error("API Route Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


