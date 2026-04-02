"use client";
import { Trip } from '@/app/my-trips/page';
import { useTripDetail, useUserDetail } from '@/app/provider';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Itinerary from '@/app/create-new-trip/_components/itinerary';
import GlobalMap from '@/app/create-new-trip/_components/GlobalMap';

function ViewTrip() {
    const { tripid } = useParams();
    const { userDetail } = useUserDetail();
    const convex = useConvex();
    const [tripData, setTripData] = useState<Trip>();
    const { setTripDetailInfo } = useTripDetail();

    useEffect(() => {
        if (userDetail && tripid) {
            GetTrip();
        }
    }, [userDetail, tripid])

    const GetTrip = async () => {
        if (!userDetail?._id || !tripid) return;

        const result = await convex.query(api.tripDetail.GetTripById, {
            uid: userDetail?._id,
            tripId: tripid + ''
        });
        console.log(result);
        if (result) {
            setTripData(result as any);
            setTripDetailInfo(result?.tripDetail);
        }
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-5'>
            <div className='md:col-span-3'>
                <Itinerary />
            </div>
            <div className='md:col-span-2'>
                <GlobalMap />
            </div>
        </div>
    )
}

export default ViewTrip
