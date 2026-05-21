import React, { useState } from "react";
import { Smartphone, MessageSquare, Gift, BarChart3, Users } from "lucide-react";

const NewServices = () => {
    const [hoveredCard, setHoveredCard] = useState(1); // Default expanded card is 02 (index 1)

    const services = [
        {
            number: "01",
            title: "Customizable Loyalty App",
            icon: Smartphone,
            image: "/landingPage/images/newServices/custom-app.png",
            description:
                "Launch your own branded loyalty app tailored to your business. Reward your customers with points, offers, and exclusive deals that keep them coming back.",
        },
        {
            number: "02",
            title: "Automatic Messages",
            icon: MessageSquare,
            image: "/landingPage/images/newServices/notification.png",
            description:
                "Send automated wishes, reminders, and promotional messages to your customers on birthdays, anniversaries, and special occasions — without lifting a finger.",
        },
        {
            number: "03",
            title: "Rewards & Offers",
            icon: Gift,
            image: "/landingPage/images/newServices/reward1.png",
            description:
                "Create and manage custom reward programs, discount coupons, and special offers to drive repeat purchases and boost customer satisfaction.",
        },
        {
            number: "04",
            title: "Business Analytics",
            icon: BarChart3,
            image: "/landingPage/images/newServices/analytics.png",
            description:
                "Get clear insights into customer behavior, visit frequency, and campaign performance with easy-to-understand dashboards and reports.",
        },
        {
            number: "05",
            title: "Customer Management",
            icon: Users,
            image: "/landingPage/images/newServices/customer.png",
            description:
                "Organize and manage your entire customer base in one place. Track visits, segment audiences, and build stronger relationships effortlessly.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F4F7] px-6 sm:px-10 md:px-16 lg:px-20 py-16">
            <div className="relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-8">
                    {/* Left Side */}
                    <div className="flex-1">
                        {/* Main Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight">
                            Our Value-Driven
                            <br />
                            <span className="text-green-600 font-medium">Services.</span>
                        </h1>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="flex flex-col md:flex-row gap-4 mt-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        const isExpanded = hoveredCard === index;

                        return (
                            <div
                                key={index}
                                className={`relative bg-[#fbfbfb] rounded-3xl p-6 cursor-pointer transition-all duration-500 ease-in-out overflow-hidden shadow-sm hover:shadow-lg flex flex-col ${isExpanded
                                        ? "flex-[2.5] h-[420px]"
                                        : "flex-1 h-[420px] justify-between"
                                    }`}
                                onMouseEnter={() => setHoveredCard(index)}
                            >
                                {/* Large Number */}
                                <span
                                    className={`absolute font-light text-gray-200 transition-all duration-500 ${isExpanded
                                            ? "text-[0px] top-5 left-6"
                                            : "text-[80px] top-4 left-4"
                                        }`}
                                    style={{ lineHeight: 1 }}
                                >
                                    {service.number}.
                                </span>

                                {/* Image - Only visible when expanded */}
                                <div className={`flex items-center justify-center transition-all duration-500 ${
                                    isExpanded ? "mt-0 mb-4 opacity-100" : "mt-0 mb-0 opacity-0"
                                }`}>
                                    <div className="w-full h-[160px] rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.parentElement.innerHTML = ``;
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Icon & Title - Always visible, changes position */}
                                <div className={`transition-all duration-500 ${
                                    isExpanded 
                                        ? "flex-1 flex flex-col justify-center" 
                                        : "flex-1 flex flex-col justify-end"
                                }`}>
                                    <div className={`bg-gray-100 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        isExpanded ? "w-10 h-10 mb-3" : "w-9 h-9 mb-3"
                                    }`}>
                                        <Icon className={`text-gray-800 transition-all duration-500 ${
                                            isExpanded ? "w-6 h-6" : "w-5 h-5"
                                        }`} />
                                    </div>
                                    <h3 className={`text-gray-900 transition-all duration-500 ${
                                        isExpanded 
                                            ? "text-2xl font-medium" 
                                            : "text-base font-medium leading-tight"
                                    }`}>
                                        {isExpanded ? service.title : (
                                            <>
                                                {service.title.split(" ").slice(0, 1).join(" ")}
                                                <br />
                                                {service.title.split(" ").slice(1).join(" ")}
                                            </>
                                        )}
                                    </h3>
                                </div>

                                {/* Description - Only visible when expanded */}
                                <div className={`pb-2 transition-all duration-500 ${
                                    isExpanded ? "opacity-100" : "opacity-0 hidden"
                                }`}>
                                    <p className="text-gray-600 text-sm leading-relaxed w-full">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NewServices;