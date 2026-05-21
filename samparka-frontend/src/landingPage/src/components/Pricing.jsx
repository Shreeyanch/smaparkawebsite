import React from 'react'
import { NewPricing } from './NewPricing'

const Pricing = () => {
  // Convert your existing pricing data to the new format
  const pricingPlans = [
    {
      name: "MONTHLY",
      price: "2299",
      yearlyPrice: "2299",
      period: "month",
      yearlyPeriod: "month",
      isStatic: true,
      features: [
        "Cloud-Based Mobile Rewards",
        "Manage Up to 500 Customers",
        "Create 5 Rewards",
        "QR Code Technology",
        "Customer Tracking Dashboard",
        "Basic Analytics",
        "Email Support",
        "Cancel Anytime"
      ],
      description: "Perfect for businesses starting out",
      buttonText: "Get Started",
      href: "#contact",
      isPopular: false,
    },
    {
      name: "SMALLBIZ",
      price: "13699",
      yearlyPrice: "25599",
      // period: "quarter",
      yearlyPeriod: "",
      features: [
        "Cloud-Based Mobile Rewards",
        "Manage Upto 2,500 Customers",
        "Create 10 Rewards",
        "Membership Creation",
        "QR Code Technology",
        "NFC Pod Technology",
        "DFY Rewards Templates",
        "Customer Tracking Dashboard",
        "Advanced Analytics",
        "Add Online Store",
        "Reservation / PreBooking Feature",
        "Abuse-free Safe Mode"
      ],
      description: "Perfect for small businesses getting started",
      buttonText: "Get Started",
      href: "#contact",
      isPopular: true,
    },
    {
      name: "MEGABIZ",
      price: "Custom",
      yearlyPrice: "Custom",
      period: "",
      yearlyPeriod: "",
      features: [
        "Everything in SmallBiz",
        "Unlimited Customers (vs 2,500)",
        "Unlimited Rewards (vs 10)",
        "Priority Support",
        "Multi-Store Management",
        "Customizable Campaigns",
        "White-Label Solution",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced API Access"
      ],
      description: "For large organizations with multiple outlets",
      buttonText: "Contact Sales",
      href: "#contact",
      isPopular: false,
    }
  ];

  return (
    <NewPricing 
      plans={pricingPlans}
      title="Choose Your Plan"
      description="Start building customer loyalty today with our flexible pricing plans.\nNo hidden fees, no long-term contracts."
    />
  )
}

export default Pricing
