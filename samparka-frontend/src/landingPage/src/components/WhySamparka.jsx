import React, { useRef, useEffect } from "react";

const WhySamparka = () => {
  return (
    <div className="relative min-h-screen py-8 px-4">
      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto overflow-x-hidden">
        
        {/* Sticky Header - Left Side */}
        <div className="w-full md:w-1/3 md:shrink-0 md:mr-2 shrink-0">
          <div className="md:sticky md:top-1/2 md:-translate-y-1/2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 leading-tight mb-6 md:mb-0">
              Why <br /> Samparka?
            </h2>
          </div>
        </div>

        {/* Cards Container - Right Side */}
        <div className="flex-1 flex flex-row md:flex-col gap-3 md:py-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          
          {/* Card 1 - Text Only */}
          <div className="bg-[#dbdbe1] rounded-2xl p-4 md:p-5 min-h-[120px] md:min-h-[160px] flex items-center w-[85vw] md:w-full shrink-0 snap-center">
            <div>
              <p className="text-xl md:text-2xl mb-2">✅</p>
              <p className="text-sm md:text-base font-normal text-gray-800">
                We simplify customer loyalty, saving you time and effort so you
                can focus on growing your business.
              </p>
            </div>
          </div>

          {/* Card 2 - No App Needed */}
          <div className="bg-[#cfc1ec] rounded-2xl p-4 flex flex-col justify-end min-h-[200px] md:min-h-[260px] w-[85vw] md:w-full shrink-0 snap-center">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/noapp.png" alt="No App" className="h-32 md:h-44 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">No App Needed</h3>
              <p className="text-xs md:text-sm text-gray-700">
                Customers don&apos;t have to download or install anything
              </p>
            </div>
          </div>

          {/* Card 3 - Increase Sales */}
          <div className="bg-[#afd5ef] rounded-2xl p-4 flex flex-col justify-end min-h-[200px] md:min-h-[260px] w-[85vw] md:w-full shrink-0 snap-center">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/increasesales.png" alt="Increase Sales" className="h-32 md:h-44 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">Increase Repeat Sales</h3>
              <p className="text-xs md:text-sm text-gray-700">
                Loyalty programs are proven to bring customers back.
              </p>
            </div>
          </div>

          {/* Card 4 - Customizable Rewards */}
          <div className="bg-[#f8e8d2] rounded-2xl p-4 flex flex-col justify-end min-h-[200px] md:min-h-[260px] w-[85vw] md:w-full shrink-0 snap-center">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/customizerewards.png" alt="Customize Rewards" className="h-32 md:h-44 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">Customizable Rewards</h3>
              <p className="text-xs md:text-sm text-gray-700">
                Keep customers excited to come back.
              </p>
            </div>
          </div>

          {/* Card 5 - Dark Text Card */}
          <div className="bg-[#212134] rounded-2xl p-4 md:p-5 min-h-[120px] md:min-h-[160px] flex items-center min-w-[280px] md:min-w-0">
            <div>
              <p className="text-xl md:text-2xl mb-2">✅</p>
              <p className="text-sm md:text-base font-normal text-white">
                At Samparka, our focus is helping businesses build real connections and make loyalty effortless.
              </p>
            </div>
          </div>

          {/* Card 6 - Smart Notifications */}
          <div className="bg-[#e6adbc] rounded-2xl p-4 flex flex-col justify-end min-h-[200px] md:min-h-[260px] min-w-[280px] md:min-w-0">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/customnotification.png" alt="Notifications" className="h-32 md:h-44 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">Smart Notifications</h3>
              <p className="text-xs md:text-sm text-gray-700">
                Send updates, offers, and reminders.
              </p>
            </div>
          </div>

          {/* Card 7 - Live Dashboards */}
          <div className="bg-[#F4EDE4] rounded-2xl p-4 flex flex-col justify-end min-h-[200px] md:min-h-[260px] min-w-[280px] md:min-w-0">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/dashboard.png" alt="Dashboard" className="h-32 md:h-44 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">Live Dashboards</h3>
              <p className="text-xs md:text-sm text-gray-700">
                Monitor performance in real time.
              </p>
            </div>
          </div>

          {/* Card 8 - Trusted Team */}
          <div className="bg-[#d1d1d7] rounded-2xl p-4 flex flex-col justify-end min-h-[180px] md:min-h-[240px] min-w-[280px] md:min-w-0">
            <div className="flex items-center justify-center relative flex-1">
              <img src="/landingPage/images/why-us/team.png" alt="Team" className="h-24 md:h-32 object-contain" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium text-base md:text-lg mb-1">Trusted Team</h3>
              <p className="text-xs md:text-sm text-gray-700">
                No more searching, verification, our experienced team is here to support you.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhySamparka;
