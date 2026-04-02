"use client"
import React, { useEffect, useState } from 'react'
import { Timeline } from "@/components/ui/timeline";
import Image from 'next/image'
import { ArrowLeft, Clock, ExternalLink, Link as LinkIcon, Star, Ticket, Timer, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HotelCarditem from './HotelCarditem';
import PlaceCarditem from './PlaceCarditem';
import { useTripDetail } from '@/app/provider';
import { TripInfo } from './ChatBox';

const TRIP_DATA = {
    "destination": "Goa, India",
    "duration": "2 days",
    "origin": "Kolkata, India",
    "budget": "Low",
    "group_size": "Solo",
    "hotels": [
        {
            "hotel_name": "The Bucket List Hostel, Goa",
            "hotel_address": "House No. 1290/1, Soranto, Anjuna, Goa 403509",
            "price_per_night": "INR 500 - 800",
            "hotel_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
            "geo_coordinates": {
                "latitude": 15.5898,
                "longitude": 73.7431
            },
            "rating": 4.5,
            "description": "A popular and highly-rated hostel in Anjuna, Goa. It offers comfortable and affordable accommodation with basic amenities. The hostel is situated in a quiet area, making it a great choice for solo travelers or those on a budget."
        },
        {
            "hotel_name": "Goa Happy Homes Hostel",
            "hotel_address": "House No. 70/1, Porbavaddo, Calangute, Goa 403516",
            "price_per_night": "INR 400 - 700",
            "hotel_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
            "geo_coordinates": {
                "latitude": 15.5458,
                "longitude": 73.7667
            },
            "rating": 4.2,
            "description": "A budget-friendly hostel located in the heart of Calangute, Goa. It offers comfortable and affordable accommodation with basic amenities. The hostel is situated in a quiet area, making it a great choice for solo travelers or those on a budget."
        }
    ],
    "itinerary": [
        {
            "day": "1",
            "day_plan": "Explore Basilica of Bom Jesus and Se Cathedral",
            "best_time_to_visit_day": "Morning to Afternoon",
            "activities": [
                {
                    "place_name": "Basilica of Bom Jesus",
                    "place_details": "A UNESCO World Heritage Site, it is known for its stunning architecture and rich history. ",
                    "place_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
                    "geo_coordinates": {
                        "latitude": 15.4988,
                        "longitude": 73.7547
                    },
                    "place_address": "Old Goa Road, Bainguinim, Velha Goa, Goa",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "1-1.5 hour",
                    "best_time_to_visit": "Morning (less crowded)"
                },
                {
                    "place_name": "Baga Beach",
                    "place_details": "Adjacent to Calangute Beach, it is known for its crystal-clear waters, golden sand, and vibrant nightlife.",
                    "place_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
                    "geo_coordinates": {
                        "latitude": 15.5658,
                        "longitude": 74.1667
                    },
                    "place_address": "Velha Goa, Goa, 403402",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "1 hour",
                    "best_time_to_visit": "Late Morning/Early Afternoon"
                }
            ]
        },
        {
            "day": "2",
            "day_plan": "Arrival in Goa, Explore Calangute Beach, Visit Se Cathedral",
            "best_time_to_visit_day": "Morning",
            "activities": [
                {
                    "place_name": "Fontainhas (Latin Quarter)",
                    "place_details": "Goa's old Latin Q",
                    "place_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
                    "geo_coordinates": {
                        "latitude": 15.4973,
                        "longitude": 73.8184
                    },
                    "place_address": "Panaji, Goa 403001",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "1.5-2 hour",
                    "best_time_to_visit": "Late Morning / Early Afternoon"
                },
                {
                    "place_name": " Calangute Beach",
                    "place_details": "Known as the \"Queen of Churches\"",
                    "place_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
                    "geo_coordinates": {
                        "latitude": 15.5458,
                        "longitude": 73.7667
                    },
                    "place_address": "Old Goa Road, Bainguinim, Velha Goa, Goa",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "1-1.5 hour",
                    "best_time_to_visit": "Morning (less crowded)"
                },
                {
                    "place_name": "Se Cathedral",
                    "place_details": "One of the largest and most popular beaches in Goa, it is known for its crystal-clear waters, golden sand, and vibrant nightlife.",
                    "place_image_url": "https://www.hostelworld.com/r/w/1290/1.jpg",
                    "geo_coordinates": {
                        "latitude": 15.5002,
                        "longitude": 73.9102
                    },
                    "place_address": "Velha Goa, Goa, 403402",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "1 hour",
                    "best_time_to_visit": "Late Morning/Early Afternoon"
                }
            ]
        }
    ]
}

function Itinerary() {
    const { tripDetailInfo } = useTripDetail();
    const [tripData, setTripData] = useState<TripInfo | null>(null);

    useEffect(() => {
        if (tripDetailInfo) {
            console.log("Updating Itinerary Data:", tripDetailInfo);
            setTripData(tripDetailInfo);
        }
    }, [tripDetailInfo]);

    const data = tripData ? [
        {
            title: "Recommended Hotels",
            content: (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {tripData?.hotels?.map((hotel, index) => (
                        <HotelCarditem hotel={hotel} key={index} />
                    ))}
                </div>
            ),
        },
        ...(tripData?.itinerary?.map((dayData) => ({
            title: `Day ${dayData.day}`,
            content: (
                <div>
                    <p className="text-gray-600 mb-4 font-medium flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Best Time: {dayData?.best_time_to_visit_day}
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {dayData?.activities?.map((activity, index) => (
                            <PlaceCarditem activity={activity} key={index} />
                        ))}
                    </div>
                </div>
            ),
        })) || [])
    ] : [];

    return (
        <div className="relative w-full h-[85vh] overflow-y-auto bg-white rounded-2xl border shadow-sm">
            {tripData ? (
                <Timeline data={data} tripData={tripData} />
            ) : (
                <div className="relative w-full h-[85vh] overflow-hidden rounded-3xl">
                    <Image
                        src={'/travel.png'}
                        alt='travel'
                        width={800}
                        height={800}
                        className='w-full h-full object-cover'
                    />
                    <h2 className='flex gap-2 text-2xl md:text-3xl font-bold text-white items-center absolute bottom-20 left-10 z-10 drop-shadow-2xl'>
                        <ArrowLeft className="animate-bounce-x" />
                        Getting to know you to build your perfect trip...
                    </h2>
                </div>

            )}
        </div>
    );
}

export default Itinerary
