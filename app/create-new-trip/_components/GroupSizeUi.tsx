"use client"
import React from 'react'


const SelectTravelesList = [
    {
        id: 1,
        title: 'Just Me',
        desc: 'A sole traveler in exploration',
        icon: '✈️',
        people: '1',
        label: 'Solo'
    },
    {
        id: 2,
        title: 'A Couple',
        desc: 'Two travelers in tandem',
        icon: '🥂',
        people: '2 People',
        label: 'Couple'
    },
    {
        id: 3,
        title: 'Family',
        desc: 'A group of fun loving adventurers',
        icon: '🏡',
        people: '3 to 5 People',
        label: 'Family'
    },
    {
        id: 4,
        title: 'Friends',
        desc: 'A bunch of thrill-seekers',
        icon: '⛵',
        people: '5 to 10 People',
        label: 'Friends'
    },
]


function GroupSizeUi({ onSelectOption, disabled }: any) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 items-center mt-1 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
            {SelectTravelesList.map((item, index) => (
                <div key={index} className='p-3 border rounded-2xl 
                bg-white hover:border-primary cursor-pointer'
                    onClick={() => onSelectOption(item.label)}
                >
                    <h2>{item.icon}</h2>
                    <h2>{item.title}</h2>
                </div>
            ))}

        </div>
    )
}
export default GroupSizeUi