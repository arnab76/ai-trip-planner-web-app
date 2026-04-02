import React from 'react'

const SelectBudgetOption = [
    {
        id: 1,
        title: 'Cheap',
        desc: 'Stay Conscious of costs',
        icon: '💵',
        color: 'bg-green-100 text-green-600',
        label: 'Low'
    },
    {
        id: 2,
        title: 'Moderate',
        desc: 'Keep cost on the average side',
        icon: '💰',
        color: 'bg-yellow-100 text-yellow-600',
        label: 'Medium'
    },
    {
        id: 3,
        title: 'Luxury',
        desc: "Don't worry about the cost",
        icon: '💸',
        color: 'bg-purple-100 text-purple-600',
        label: 'High'
    },
]
function BudgetUi({ onSelectOption, disabled }: any) {
    return (
        <div className={`grid grid-cols-3 md:grid-cols-3 gap-2 items-center mt-1 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
            {SelectBudgetOption.map((item, index) => (
                <div key={index} className='p-3 border rounded-2xl 
                   bg-white hover:border-primary cursor-pointer flex flex-col items-center text-center'
                    onClick={() => onSelectOption(item.label)}
                >
                    <div className={`text-3xl p-3 rounded-full ${item.color}`}>{item.icon}</div>
                    <h2 className='text-lg font-semibold mt-2'>{item.title}</h2>
                    <p className='text-sm text-gray-500'>{item.desc}</p>
                </div>
            ))}

        </div>
    )
}

export default BudgetUi