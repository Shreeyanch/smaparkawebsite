import React from 'react'

const HeroSide = () => {
    return (
        <div className='relative h-[120vh] w-full flex justify-center items-center bg-zinc-300'>
            <div className='absolute left-1/8 -top-20 z-50'>
                {/* side images */}
                <img 
                    className='w-60 drop-shadow-lg' 
                    src="/landingPage/images/boost_retention.png" 
                    alt="Leaderboard model" 
                />
                <h1 className='mt-3 text-2xl font-semibold'>Boost Retention</h1>
                <p className='max-w-xl w-64'>Keep customers coming back with personalized rewards they love.</p>
            </div>
            <div className='absolute right-20 top-1/3 z-50'>
                {/* side images */}
                <img 
                    className='w-60 drop-shadow-lg' 
                    src="/landingPage/images/kyc.png" 
                    alt="Leaderboard model" 
                />
                <h1 className='mt-3 text-2xl font-semibold'>Know your customers</h1>
                <p className='max-w-xl w-64'>Track visits, spending, and reward usage in real time.</p>
            </div>
            <div className='absolute left-1/8 bottom-10 z-50'>
                {/* side images */}
                <img 
                    className='w-60 drop-shadow-lg' 
                    src="/landingPage/images/remainder.png" 
                    alt="Leaderboard model" 
                />
                <h1 className='mt-3 text-2xl font-semibold'>Stay top-of-mind</h1>
                <p className='max-w-xl w-64'>Send reminders, promotions, and offers that bring customers back.</p>
            </div>
        </div>
    )
}

export default HeroSide