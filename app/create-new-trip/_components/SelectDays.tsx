"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

function SelectDays({ onSelectOption, disabled }: any) {
  const [days, setDays] = useState(3);
  return (
    <div className={`p-5 border rounded-2xl bg-gray-100 flex flex-col items-center gap-5 my-3 ${disabled ? 'opacity-70' : ''}`}>
      <h2 className='font-bold text-lg'>How many days do you want to travel?</h2>
      <div className={`flex gap-5 items-center bg-white p-3 rounded-xl shadow-sm ${disabled ? 'pointer-events-none' : ''}`}>
        <Button
          variant='outline'
          size='icon'
          className='h-10 w-10 text-lg font-bold'
          disabled={disabled}
          onClick={() => days > 1 && setDays(days - 1)}
        >
          -
        </Button>
        <h2 className='font-bold text-xl w-20 text-center'>{days} Days</h2>
        <Button
          variant='outline'
          size='icon'
          className='h-10 w-10 text-lg font-bold'
          disabled={disabled}
          onClick={() => setDays(days + 1)}
        >
          +
        </Button>
      </div>

      <Button
        className='w-full mt-2'
        disabled={disabled}
        onClick={() => onSelectOption(days + ' Days')}
      >
        Confirm
      </Button>
    </div>
  )
}

export default SelectDays