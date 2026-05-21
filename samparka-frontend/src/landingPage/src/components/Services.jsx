import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Service details data
  const serviceDetails = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Manage Your Loyalty Program",
      description: "Manage your customers, loyalty points, and engagement from a single, intuitive dashboard. Make quick decisions and optimize your program effortlessly.",
      features: [
        "Real-time tracking of customers and points",
        "Easy program configuration",
        "Secure cloud-based access",
        "Monitor program performance"
      ],
      technologies: ["Cloud-Based", "Real-time Analytics", "Secure Access"],
      image: "/landingPage/images/services-elements/dashboard.png"
    },
    customizable: {
      title: "Customizable",
      subtitle: "Tailored to Your Brand",
      description: "Tailor your loyalty program to fit your brand, rewards, and customer experience — including your own app in customers' phones.",
      features: [
        "Points for purchases or visits",
        "Tiered loyalty (Silver, Gold, Platinum)",
        "Branded app experience",
        "Flexible reward rules"
      ],
      technologies: ["Custom Branding", "Multi-tier System", "Mobile App"],
      image: "/landingPage/images/services-elements/customization3.png"
    },
    analytics: {
      title: "Analytics",
      subtitle: "Actionable Insights",
      description: "Get actionable insights into customer behavior and loyalty program performance to make smarter decisions.",
      features: [
        "Track engagement, visits, and redemptions",
        "Understand demographics and buying trends",
        "Identify what drives repeat business",
        "Measure program ROI"
      ],
      technologies: ["Business Intelligence", "Customer Analytics", "Performance Metrics"],
      image: "/landingPage/images/services-elements/dashboard.png"
    },
    reservation: {
      title: "Reservation",
      subtitle: "Direct Booking System",
      description: "Let customers book services directly through your loyalty program for convenience and repeat business.",
      features: [
        "Real-time booking confirmations",
        "Admin approval and tracking",
        "Works for salons, restaurants, spas, hotels, and more",
        "Streamlines operations and improves satisfaction"
      ],
      technologies: ["Real-time Booking", "Multi-industry Support", "Admin Controls"],
      image: "/landingPage/images/services-elements/reservations.avif"
    },
    store: {
      title: "Store",
      subtitle: "E-commerce Integration",
      description: "Connect online sales with your loyalty program to encourage repeat purchases and simplify reward management.",
      features: [
        "Sync eCommerce transactions with loyalty points",
        "Reward repeat buyers automatically",
        "Manage products and stock in one place",
        "Boost customer lifetime value"
      ],
      technologies: ["E-commerce Sync", "Automated Rewards", "Inventory Management"],
      image: "/landingPage/images/services-elements/online.png"
    },
    gamification: {
      title: "Gamification",
      subtitle: "Make Loyalty Fun",
      description: "Make loyalty fun and engaging with interactive challenges, games, and leaderboards.",
      features: [
        "Scratch & Win games",
        "Leaderboards for top customers",
        "Encourage social sharing",
        "Drive repeat visits and engagement"
      ],
      technologies: ["Interactive Games", "Social Integration", "Engagement Tools"],
      image: "/landingPage/images/services-elements/allfeatures.png"
    },
    integrations: {
      title: "Integrations",
      subtitle: "Seamless Connectivity",
      description: "Connect seamlessly with POS, CRM, and other business tools to simplify operations.",
      features: [
        "Smooth POS & CRM integration",
        "Cloud-based, reliable infrastructure",
        "Secure data with encryption",
        "Automation-ready for marketing and rewards"
      ],
      technologies: ["POS Integration", "CRM Systems", "Cloud Infrastructure", "API Access"],
      image: "/landingPage/images/services-elements/customization.png"
    },
    consulting: {
      title: "Consulting",
      subtitle: "Expert Guidance",
      description: "Expert guidance to set up, optimize, and grow your loyalty program efficiently.",
      features: [
        "Tailored strategy for your business goals",
        "Support during implementation and launch",
        "Ongoing program optimization",
        "Maximize ROI and customer retention"
      ],
      technologies: ["Strategy Planning", "Implementation Support", "ROI Optimization"],
      image: "/landingPage/images/services-elements/as.png"
    },
    automation: {
      title: "Automation & Notification",
      subtitle: "Multi-Channel Engagement",
      description: "Keep customers engaged automatically through multiple channels, saving time and cost.",
      features: [
        "Email automation via SMTP",
        "SMS alerts",
        "App notifications",
        "WhatsApp automation",
        "Triggered alerts for points, rewards, reviews, special offers, birthdays, and seasonal promotions"
      ],
      technologies: ["Email (SMTP)", "SMS", "Push Notifications", "WhatsApp", "Marketing Automation"],
      image: "/landingPage/images/services-elements/notification2.png"
    }
  };

  const openModal = (serviceKey) => {
    setSelectedService(serviceDetails[serviceKey]);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  // Spin the Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState('');

  const wheelPrizes = [
    '/landingPage/images/services-elements/icon1.png',
    '/landingPage/images/services-elements/icon2.png',
    '/landingPage/images/services-elements/icon3.png',
    '/landingPage/images/services-elements/icon4.png',
    '/landingPage/images/services-elements/icon5.png',
    '/landingPage/images/services-elements/icon6.png',
    '/landingPage/images/services-elements/icon7.png',
    '/landingPage/images/services-elements/icon8.png'
  ];

  const spinWheel = (e) => {
    e.stopPropagation();
    if (isSpinning) return;

    setIsSpinning(true);
    setResult('');

    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360; // Random position
    const totalRotation = rotation + (spins * 360) + extraDegrees;

    setRotation(totalRotation);

    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      const segmentAngle = 360 / wheelPrizes.length;
      const prizeIndex = Math.floor((360 - finalAngle) / segmentAngle) % wheelPrizes.length;
      setResult(wheelPrizes[prizeIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-4 md:mb-6 lg:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Services
          </h2>
        </div>

        {/* Bento Grid Layout - Custom Grid Format */}
        <div className="flex justify-center items-center w-full">
          <div className="grid grid-cols-8 grid-rows-8 gap-2 md:gap-2 lg:gap-3 w-full max-w-7xl min-h-[600px] md:h-[calc(100vh)] lg:h-[calc(100vh)]">

            {/* div1 - Center Large Card (Customizable) */}
            <div
              className="col-span-10 md:col-span-4 md:col-start-3 row-span-40 md:row-span-3 md:row-start-3 rounded-2xl md:rounded-3xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group "
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('customizable')}
            >
              {/* Logo Behind Girl - Lower z-index */}
              <div className="block lg:hidden absolute top-0 w-full z-0">
                <img
                  src="/landingPage/images/logo_black.png"
                  alt="Samparka"
                  className="w-3/4 mx-auto"
                />
              </div>

              {/* Person with Phone Image - Higher z-index */}
              <div className="flex items-end justify-center z-10  relative h-full">
                <img
                  src="/landingPage/images/services-elements/team.png"
                  alt="Digital Loyalty"
                  className="h-[350px] w-[350px] size-96 -bottom-20  absolute"
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.2))',
                  }}
                />
              </div>
            </div>

            {/* div2 - Spatial Analytics Dashboard */}
            <div
              className="col-span-5 md:col-span-2 md:col-start-1 row-span-4 md:row-span-4 md:row-start- rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('dashboard')}
            >

              <div className="p-2 md:p-2 h-full flex flex-col gap-1.5">

                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div>

                    <p className="text-[8px] md:text-[9px] text-gray-500">Customer Analytics</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>

                {/* Stats Grid - 2x2 with Total Customers */}
                <div className="grid grid-cols-2 gap-0.5">
                  <Card className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-sm h-5">
                    <CardContent className="p-0 h-full flex items-center justify-between px-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-900"></div>
                        <p className="text-[5px] md:text-[6px] text-gray-500">Total</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <p className="text-xs md:text-sm font-bold text-gray-900">139</p>
                        <p className="text-[4px] md:text-[5px] text-emerald-600">+12.5%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-sm h-5">
                    <CardContent className="p-0 h-full flex items-center justify-between px-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-emerald-500"></div>
                        <p className="text-[5px] md:text-[6px] text-gray-500">Active</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <p className="text-xs md:text-sm font-bold text-gray-900">123</p>
                        <p className="text-[4px] md:text-[5px] text-gray-400">88.5%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-sm h-5">
                    <CardContent className="p-0 h-full flex items-center justify-between px-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
                        <p className="text-[5px] md:text-[6px] text-gray-500">Inactive</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <p className="text-xs md:text-sm font-bold text-gray-900">16</p>
                        <p className="text-[4px] md:text-[5px] text-gray-400">11.5%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-sm h-5">
                    <CardContent className="p-0 h-full flex items-center justify-between px-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-purple-500"></div>
                        <p className="text-[5px] md:text-[6px] text-gray-500">Stores</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <p className="text-xs md:text-sm font-bold text-gray-900">128</p>
                        <p className="text-[4px] md:text-[5px] text-gray-400">+8 new</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Section - Table */}

                <div className="px-1.5 py-1 border-b border-gray-200/50">
                  <p className="text-[8px] md:text-[9px] font-medium text-gray-700">Recent Activity</p>
                </div>
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200/50">
                        <TableHead className="text-[6px] md:text-[7px] h-5 px-1.5">Customer</TableHead>
                        <TableHead className="text-[6px] md:text-[7px] h-5 px-1.5">Visits</TableHead>
                        <TableHead className="text-[6px] md:text-[7px] h-5 px-1.5">Points</TableHead>
                        <TableHead className="text-[6px] md:text-[7px] h-5 px-1.5">Spent</TableHead>
                        <TableHead className="text-[6px] md:text-[7px] h-5 px-1.5">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-gray-100/50 hover:bg-gray-50/30">
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[6px] font-semibold text-gray-600">S</span>
                            </div>
                            <span className="text-[6px] md:text-[7px] font-medium text-gray-800">Shreeyanch</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">24</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">2,400</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">$580</TableCell>
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <span className="text-[6px] md:text-[7px] text-gray-500">Active</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b border-gray-100/50 hover:bg-gray-50/30">
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[6px] font-semibold text-gray-600">S</span>
                            </div>
                            <span className="text-[6px] md:text-[7px] font-medium text-gray-800">Saman</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">18</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">1,800</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">$420</TableCell>
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <span className="text-[6px] md:text-[7px] text-gray-500">Active</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b border-gray-100/50 hover:bg-gray-50/30">
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[6px] font-semibold text-gray-600">S</span>
                            </div>
                            <span className="text-[6px] md:text-[7px] font-medium text-gray-800">Srijita</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">12</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">1,200</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">$290</TableCell>
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <span className="text-[7px] md:text-[8px] text-gray-500">Away</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50/30">
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[6px] font-semibold text-gray-600">R</span>
                            </div>
                            <span className="text-[6px] md:text-[7px] font-medium text-gray-800">Rahul</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">15</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">1,500</TableCell>
                        <TableCell className="text-[6px] md:text-[7px] text-gray-600 py-0.5 px-1.5">$350</TableCell>
                        <TableCell className="py-0.5 px-1.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <span className="text-[6px] md:text-[7px] text-gray-500">Active</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="px-2 mt-4">
                  <h2 className="text-sm md:text-sm lg:text-base font-bold">Dashboard</h2>

                  <p className="text-[10px] md:text-[10px] lg:text-xs"> Manage your customers, loyalty points, and engagement from a single, intuitive dashboard. Make quick decisions and optimize your program effortlessly.</p>
                </div>

                <div>

                </div>
              </div>
            </div>

            {/* div3 - Notification Section */}
            <div
              className="col-span-5 md:col-span-2 md:col-start-3 row-span-2 md:row-span-2 md:row-start-1 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer p-2 md:p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('automation')}
            >
              <div className="flex items-center justify-center h-20 md:h-24 relative w-full p-1">
                <img
                  src="/landingPage/images/services-elements/notification3.png"
                  alt="Notifications"
                  className="w-full h-20 md:h-24 absolute top-0 object-contain"
                />
              </div>
              <div className="px-4 md:px-6">
                <h2 className="text-sm md:text-base lg:text-lg font-bold text-black">Custom Notification</h2>
                <p className="text-[9px] md:text-[10px] lg:text-xs"> Keep customers engaged. <span className="block lg:hidden">
                  automatically through multiple channels.
                </span></p>
              </div>
            </div>

            {/* div4 - Reservation */}
            <div
              className="col-span-5 md:col-span-2 md:col-start-5 row-span-2 md:row-span-2 md:row-start-1 rounded-2xl md:rounded-2xl relative transition-all duration-300 hover:scale-[1.02] cursor-pointer p-2 md:p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('reservation')}
            >
              <div className="flex items-center justify-center h-28 md:h-32 w-full p-1 -mt-6 md:-mt-8">
                <img
                  src="/landingPage/images/services-elements/reservations.avif"
                  alt="Reservations"
                  className="w-36 md:w-40 h-28 md:h-32 rounded-xl object-cover"
                />
              </div>
              <div className="px-4 md:px-6">
                <h2 className="text-sm md:text-base lg:text-lg font-bold">Reservation</h2>
                <p className="text-[9px] md:text-[10px] lg:text-xs"> Let customers book services directly.</p>
              </div>
            </div>

            {/* div6 - Analytics Chart */}
            <div
              className="col-span-5 md:col-span-2 md:col-start-7 row-span-6 md:row-span-3 md:row-start-1 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer p-2"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('analytics')}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-1">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold">Analytics</h3>
                  <p className="text-[6px] md:text-[7px] lg:text-[8px] text-gray-500">New customers over 3 months</p>
                </div>

                {/* Chart */}
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: 'Jun 24', customers: 320, secondary: 180 },
                        { date: 'Jun 25', customers: 280, secondary: 350 },
                        { date: 'Jun 26', customers: 420, secondary: 480 },
                        { date: 'Jun 27', customers: 580, secondary: 620 },
                        { date: 'Jun 28', customers: 520, secondary: 280 },
                        { date: 'Jun 29', customers: 380, secondary: 440 },
                        { date: 'Jun 30', customers: 620, secondary: 760 },
                      ]}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 800]}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-2">
                                <p className="text-[8px] text-gray-500">{payload[0].payload.date}</p>
                                <p className="text-xs font-semibold text-gray-900">{payload[0].value} customers</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="secondary"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-0.5 mt-1">
                  <div className="text-center p-0.5 bg-transparent">
                    <p className="text-[6px] text-gray-500">This Month</p>
                    <p className="text-[10px] font-bold text-gray-900">+127</p>
                  </div>
                  <div className="text-center p-0.5 bg-transparent">
                    <p className="text-[6px] text-gray-500">Growth</p>
                    <p className="text-[10px] font-bold text-emerald-600">+18%</p>
                  </div>
                  <div className="text-center p-0.5 bg-transparent">
                    <p className="text-[6px] text-gray-500">Active</p>
                    <p className="text-[10px] font-bold text-emerald-600">1.2K</p>
                  </div>
                  <div className="text-center p-0.5 bg-transparent">
                    <p className="text-[6px] text-gray-500">Churn</p>
                    <p className="text-[10px] font-bold text-orange-600">5.3%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* div7 - Customization */}
            <div
              className="col-span-5 md:col-span-2 md:col-start-1 row-span-6 md:row-span-3 md:row-start-1 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer  flex justify-between flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('customizable')}
            >
              <div className="p-4 md:p-6">
                <h2 className="text-sm md:text-base lg:text-lg font-bold">Customization</h2>
                <p className="text-white md:text-black mt-2 text-[9px] md:text-[10px] lg:text-xs">Tailor your loyalty program to fit your brand, rewards, and customer experience.</p>
              </div>
              <div className="flex items-center justify-center w-full p-2 relative">
                <img
                  src="/landingPage/images/services-elements/customization4.png"
                  alt="Customization"
                  className="w-4/5 h-36 md:h-44 absolute -bottom-8 md:-bottom-10 object-contain"
                />
              </div>
            </div>

            {/* div8 - Spin the Wheel Game */}
            <div
              className="order-9 md:order-none col-span-5 md:col-span-2 md:col-start-3 row-span-8 md:row-span-2 md:row-start-6 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] p-2 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('gamification')}
            >
              <div className="flex flex-col items-center justify-center h-full relative">
                <div className="w-full absolute top-0">
                  <h2 className="text-start hidden md:block font-bold text-sm md:text-base lg:text-lg">Gamification</h2>
                  {/* <h2 className="text-start block md:hidden font-bold">Gamify</h2> */}
                </div>
                {/* Wheel Container */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 ">
                  {/* Pointer/Arrow at top */}
                  <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '10px solid #374151',
                    }}
                  ></div>

                  {/* Spinning Wheel */}
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden cursor-pointer"
                    style={{
                      background: 'conic-gradient(from 0deg, #f3f4f6 0deg 45deg, #e5e7eb 45deg 90deg, #f3f4f6 90deg 135deg, #e5e7eb 135deg 180deg, #f3f4f6 180deg 225deg, #e5e7eb 225deg 270deg, #f3f4f6 270deg 315deg, #e5e7eb 315deg 360deg)',
                      border: '3px solid #d1d5db',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    }}
                    onClick={spinWheel}
                  >
                    {/* Divider Lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="absolute w-full h-0.5 bg-gray-300"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                          transform: `rotate(${i * 45}deg)`,
                        }}
                      ></div>
                    ))}

                    {/* Center Circle */}
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-gray-700 text-[10px] z-10 border-2 border-gray-400"
                      style={{
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      SPIN
                    </div>

                    {/* Prize Labels */}
                    {wheelPrizes.map((prize, index) => {
                      const angle = (360 / wheelPrizes.length) * index;
                      const radius = 48; // Distance from center - reduced
                      return (
                        <div
                          key={index}
                          className="absolute"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${angle + 22.5}deg) translateY(-${radius}px)`,
                            transformOrigin: '0 0',
                          }}
                        >
                          <img
                            src={prize}
                            alt={`Prize ${index + 1}`}
                            className="w-4 h-4 md:w-5 md:h-5"
                            style={{
                              display: 'inline-block',
                              transform: 'rotate(0deg)',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Result Display */}
                {result && (
                  <div
                    className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 justify-center mt-2"
                    style={{
                      background: 'white',
                      color: '#374151',
                      border: '2px solid #d1d5db',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <span>You won:</span>
                    <img
                      src={result}
                      alt="Prize"
                      className="w-5 h-5"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>


            </div>

            {/* div9 - Consulting */}
            <div
              className="order-8 md:order-none col-span-4 md:col-span-2 md:col-start-7 row-span-8 md:row-span-2 md:row-start-4 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer p-3 md:p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('consulting')}
            >
              <div className="flex flex-col h-full justify-between">
                {/* Top Section - Team avatars */}
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-700 mb-1.5">Team of passionate</p>
                  <p className="text-[10px] md:text-xs font-bold text-gray-700 mb-2">designers and developers</p>

                  {/* Avatar Stack */}
                  <div className="flex items-center -space-x-1.5 mb-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <img
                        src="/landingPage/images/services-elements/team1.png"
                        alt="Team Member 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <img
                        src="/landingPage/images/services-elements/team2.jpg"
                        alt="Team Member 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <img
                        src="/landingPage/images/services-elements/team3.png"
                        alt="Team Member 3"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <img
                        src="/landingPage/images/services-elements/team4.jpg"
                        alt="Team Member 4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                      <span className="text-white text-[8px] font-semibold">+2</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Stats */}
                <div className="flex items-center gap-2">
                  <div>

                    <h3 className="text-sm md:text-lg lg:text-xl font-bold text-gray-800 mb-0.5">Repeated</h3>
                    <h3 className="text-sm md:text-lg lg:text-xl font-bold text-gray-800 mb-1.5">Customers</h3>
                  </div>

                  <div className="flex items-end gap-1.5">
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">54</p>
                    <p className="text-xs md:text-lg lg:text-xl font-bold text-[#36a973] mb-0.5">+40%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* div10 - eStore */}
            <div
              className="col-span-10 md:col-span-4 md:col-start-5 row-span-2 md:row-start-6 rounded-2xl md:rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer p-3 md:p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
              onClick={() => openModal('store')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-2/5">
                  <img
                    src="/landingPage/images/services-elements/online.png"
                    alt="eStore"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="p-4 md:p-6 w-3/5">
                  <h3 className="text-sm md:text-lg lg:text-xl font-semibold text-gray-800 leading-tight mb-2">
                    We help you build your very own eStore
                  </h3>
                  <p className="text-[9px] md:text-[10px] lg:text-xs">Connect online sales with your loyalty program to encourage repeat purchases and simplify reward management.
                    Key Benefits:</p>
                </div>

              </div>

              {/* <div className="border-2 relative h-full">
                 <img
                    src="/landingPage/images/services-elements/online.png"
                    alt="eStore"
                    className="w-40 rotate-90 border-2 absolute -top-25 right-1/2 translate-x-1/2"
                  />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Modal */}
      {isModalOpen && selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={closeModal}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedService.title}</h2>
                  <p className="text-lg text-white/90">{selectedService.subtitle}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Image/Analytics and Description */}
                <div>
                  {selectedService.title === "Analytics" ? (
                    /* Analytics Interactive Section */
                    <div className="mb-6 space-y-3">
                      {/* Mini Chart */}
                      <Card
                        className="border-white/30 shadow-lg"
                        style={{
                          background: 'transparent',
                        }}
                      >
                        <CardContent className="p-3">
                          <p className="text-xs text-white/90 mb-2 font-medium">Customer Growth Trend</p>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={[
                                  { month: 'Jan', customers: 890 },
                                  { month: 'Feb', customers: 920 },
                                  { month: 'Mar', customers: 1020 },
                                  { month: 'Apr', customers: 1150 },
                                  { month: 'May', customers: 1200 },
                                  { month: 'Jun', customers: 1284 },
                                ]}
                                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                              >
                                <defs>
                                  <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#fff' }} stroke="rgba(255, 255, 255, 0.3)" />
                                <YAxis tick={{ fontSize: 10, fill: '#fff' }} stroke="rgba(255, 255, 255, 0.3)" />
                                <ChartTooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div
                                          className="rounded-lg shadow-xl p-2 border border-white/30"
                                          style={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                          }}
                                        >
                                          <p className="text-xs font-semibold text-gray-900">{payload[0].payload.month}</p>
                                          <p className="text-xs text-emerald-600">{payload[0].value} customers</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="customers"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  fill="url(#miniGradient)"
                                  dot={{ fill: '#10b981', r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mini Stats Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2">
                            <p className="text-[10px] text-white/80">Customers</p>
                            <p className="text-lg font-bold text-white">1,284</p>
                            <p className="text-[9px] text-emerald-400">+12.5%</p>
                          </CardContent>
                        </Card>
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2">
                            <p className="text-[10px] text-white/80">Visits</p>
                            <p className="text-lg font-bold text-white">8,456</p>
                            <p className="text-[9px] text-emerald-400">+8.3%</p>
                          </CardContent>
                        </Card>
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2">
                            <p className="text-[10px] text-white/80">Retention</p>
                            <p className="text-lg font-bold text-white">82%</p>
                            <p className="text-[9px] text-blue-400">+3.1%</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : selectedService.title === "Dashboard" ? (
                    /* Dashboard Interactive Section */
                    <div className="mb-6 space-y-3">
                      {/* Dashboard Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2">
                            <p className="text-[10px] text-white/80">Total Points</p>
                            <p className="text-xl font-bold text-white">45.2K</p>
                            <p className="text-[9px] text-emerald-400">Active</p>
                          </CardContent>
                        </Card>
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2">
                            <p className="text-[10px] text-white/80">Redeemed</p>
                            <p className="text-xl font-bold text-white">12.8K</p>
                            <p className="text-[9px] text-blue-400">This month</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Activity Table */}
                      <Card
                        className="border-white/30 shadow-lg"
                        style={{
                          background: 'transparent',
                        }}
                      >
                        <CardContent className="p-2">
                          <p className="text-xs text-white/90 mb-2 font-medium">Recent Activity</p>
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/20">
                                <TableHead className="text-[9px] text-white/80 h-6 px-2">Customer</TableHead>
                                <TableHead className="text-[9px] text-white/80 h-6 px-2">Points</TableHead>
                                <TableHead className="text-[9px] text-white/80 h-6 px-2">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="border-white/10">
                                <TableCell className="text-[10px] text-white py-1 px-2">Shreeyanch</TableCell>
                                <TableCell className="text-[10px] text-white py-1 px-2">2,400</TableCell>
                                <TableCell className="py-1 px-2">
                                  <span className="text-[9px] text-emerald-400">Active</span>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-white/10">
                                <TableCell className="text-[10px] text-white py-1 px-2">Saman</TableCell>
                                <TableCell className="text-[10px] text-white py-1 px-2">1,800</TableCell>
                                <TableCell className="py-1 px-2">
                                  <span className="text-[9px] text-emerald-400">Active</span>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-white/10">
                                <TableCell className="text-[10px] text-white py-1 px-2">Rahul</TableCell>
                                <TableCell className="text-[10px] text-white py-1 px-2">1,500</TableCell>
                                <TableCell className="py-1 px-2">
                                  <span className="text-[9px] text-blue-400">Pending</span>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2 text-center">
                            <p className="text-lg font-bold text-white">139</p>
                            <p className="text-[9px] text-white/80">Total</p>
                          </CardContent>
                        </Card>
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2 text-center">
                            <p className="text-lg font-bold text-white">128</p>
                            <p className="text-[9px] text-white/80">Active</p>
                          </CardContent>
                        </Card>
                        <Card
                          className="border-white/30 shadow-lg"
                          style={{
                            background: 'transparent',
                          }}
                        >
                          <CardContent className="p-2 text-center">
                            <p className="text-lg font-bold text-white">11</p>
                            <p className="text-[9px] text-white/80">New</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : selectedService.title === "Gamification" ? (
                    /* Gamification Interactive Leaderboard - Fun Sized */
                    <div className="mb-6">
                      {/* Leaderboard Header */}
                      <Card
                        className="border-white/30 shadow-lg"
                        style={{
                          background: 'transparent',
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🏆</span>
                              <p className="text-sm text-white font-bold">Loyalty Champions</p>
                            </div>
                            <Badge
                              className="text-[8px] px-2 py-0.5"
                              style={{
                                background: 'rgba(34, 197, 94, 0.3)',
                                color: '#4ade80',
                                border: '1px solid rgba(34, 197, 94, 0.5)'
                              }}
                            >
                              LIVE
                            </Badge>
                          </div>

                          {/* Top 3 Players - Compact */}
                          <div className="space-y-2">
                            {/* #1 */}
                            <div
                              className="flex items-center justify-between p-2 rounded-lg border border-amber-400/50"
                              style={{
                                background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🥇</span>
                                <div>
                                  <p className="text-xs font-bold text-white">Shreeyanch</p>
                                  <p className="text-[9px] text-amber-300">4,850 pts</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Badge className="text-[8px] px-1.5 py-0" style={{ background: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24', border: 'none' }}>
                                  Platinum
                                </Badge>
                              </div>
                            </div>

                            {/* #2 */}
                            <div
                              className="flex items-center justify-between p-2 rounded-lg border border-gray-300/30"
                              style={{
                                background: 'rgba(192, 192, 192, 0.1)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">�</span>
                                <div>
                                  <p className="text-xs font-bold text-white">Saman</p>
                                  <p className="text-[9px] text-gray-300">3,920 pts</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Badge className="text-[8px] px-1.5 py-0" style={{ background: 'rgba(192, 192, 192, 0.3)', color: '#d1d5db', border: 'none' }}>
                                  Gold
                                </Badge>
                              </div>
                            </div>

                            {/* #3 */}
                            <div
                              className="flex items-center justify-between p-2 rounded-lg border border-orange-400/30"
                              style={{
                                background: 'rgba(205, 127, 50, 0.1)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">�</span>
                                <div>
                                  <p className="text-xs font-bold text-white">Rahul</p>
                                  <p className="text-[9px] text-orange-300">3,540 pts</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Badge className="text-[8px] px-1.5 py-0" style={{ background: 'rgba(205, 127, 50, 0.3)', color: '#fdba74', border: 'none' }}>
                                  Gold
                                </Badge>
                              </div>
                            </div>

                            {/* Quick List 4-5 */}
                            <div className="pt-2 space-y-1 border-t border-white/10">
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60 text-[10px] font-bold w-3">4</span>
                                  <span className="text-[10px] text-white">Srijita</span>
                                </div>
                                <span className="text-[10px] text-white/70">2,890 pts</span>
                              </div>
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60 text-[10px] font-bold w-3">5</span>
                                  <span className="text-[10px] text-white">Kris</span>
                                </div>
                                <span className="text-[10px] text-white/70">2,650 pts</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>



                      {/* Achievement Banner */}
                      <Card
                        className="border-white/30 shadow-lg"
                        style={{
                          background: 'transparent',
                        }}
                      >
                        <CardContent className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">✨</span>
                            <div className="flex-1">
                              <p className="text-[10px] text-white/90 font-medium">New Achievement Unlocked!</p>
                              <p className="text-[9px] text-white/70">Shreeyanch reached Platinum status 🎉</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    selectedService.image && (
                      <div className="mb-6">
                        <img
                          src={selectedService.image}
                          alt={selectedService.title}
                          className="w-full h-48  rounded-xl shadow-lg object-contain"
                        />
                      </div>
                    )
                  )}
                  <p className="text-white/90 leading-relaxed mb-6">
                    {selectedService.description}
                  </p>
                </div>

                {/* Right Column - Features and Technologies */}
                <div>
                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
                    <div className="space-y-3">
                      {selectedService.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                            style={{ background: 'rgba(34, 197, 94, 0.8)' }}
                          ></div>
                          <span className="text-white/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm text-white font-medium"
                          style={{
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)'
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {/* <div className="p-6 border-t border-white/20">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                  }}
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(59, 130, 246, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.4)'
                  }}
                >
                  Get Started
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
