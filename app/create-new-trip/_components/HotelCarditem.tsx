"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Star, Wallet } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Hotel } from './ChatBox'
import axios from 'axios'

type Props = {
    hotel: Hotel
}

function HotelCarditem({ hotel }: Props) {

    const [photoUrl, setPhotoUrl] = useState<string>();
    useEffect(() => {
        hotel && GetGooglePlaceDetail();
    }, [hotel])

    const GetGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place-detail', {
            placeName: hotel?.hotel_name
        });
        if (result?.data?.error) {
            return;
        }
        setPhotoUrl(result?.data);
    }
    return (
        <div className='flex flex-col gap-1'>
            <Image src={photoUrl || '/placeholder.jpg'} alt='Hotel Image' width={400} height={200}
                className='rounded-xl shadow object-cover mb-2'
            />
            <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
            <h2 className='text-gray-500'>{hotel?.hotel_address}</h2>
            <div className='flex justify-between items-center mt-2'>
                <p className='flex gap-4 text-green-600'><Wallet />{hotel.price_per_night}</p>
                <p className='text-yellow-500 flex gap-1'><Star />{hotel.rating}</p>
            </div>
            <Link href={'https://www.google.com/maps/search/?api=1&query=' + hotel?.hotel_name} target='_blank'>
                <Button size={'sm'} variant={'outline'} className='w-full mt-2'>View <ExternalLink /></Button>
            </Link>
            {/* <p className='line-clamp-2 text-gray-500'>{hotel.description}</p> */}
        </div>
    )
}

export default HotelCarditem