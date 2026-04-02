"use client";
import React, { useEffect, useState } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/itinerary'
import { useTripDetail } from '../provider';
import GlobalMap from './_components/GlobalMap';
import { Button } from '@/components/ui/button';
import { Globe2, Plane } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

function CreateNewTrip() {
    const { tripDetailInfo, setTripDetailInfo } = useTripDetail();
    const [activeIndex, setActiveIndex] = useState(1);

    useEffect(() => {
        setTripDetailInfo(null)
    }, [])


    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-10'>
            <div>
                <ChatBox />
            </div>
            <div className='col-span-2 relative'>
                {activeIndex == 0 ? <Itinerary /> : <GlobalMap />}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild className='absolute bg-black bottom-10 left-[50%] rounded-2xl'>
                            <Button
                                size={'lg'} className='bg-gray-600 hover:primary'
                                onClick={() => setActiveIndex(activeIndex == 0 ? 1 : 0)}
                            > {activeIndex == 0 ? < Plane /> : <Globe2 />}</Button>
                        </TooltipTrigger>
                        <TooltipContent className='bg-black text-white'>
                            Switch Between Map and Trip
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
        </div>
    )
}

export default CreateNewTrip