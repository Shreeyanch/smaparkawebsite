import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { useGeoPricing } from "../pricing/useGeoPricing";

/**
 * Plan metadata — features, copy, styles.
 * Pricing numbers live exclusively in pricingConfig.js.
 */
const PLAN_METADATA = [
  {
    id: "starter",
    name: "Starter Plan",
    description: "7-day free trial to explore all features. No credit card required.",
    isFree: true,
    duration: "7 days",
    features: [
      "Digital loyalty system (earn/redeem)",
      "QR code-based point earning",
      "Personal branding (logo/colors)",
      "Cloud admin & sub-admin access",
      "Secure customer database",
      "Basic customer dashboard",
      "Automated triggers (birthday, etc.)",
      "Basic notifications (Email/SMS)",
    ],
    buttonText: "Start Free Trial",
    href: "/login",
    badge: "7-DAY FREE TRIAL",
    badgeClass: "bg-gray-900 text-white",
    cardClass: "border-gray-900 shadow-xl z-10",
  },
  {
    id: "growth",
    name: "Growth Plan",
    description: "For businesses focused on engagement and repeat visits.",
    features: [
      "All Starter features",
      "Advanced tracking & segmentation",
      "Advanced analytics and reports",
      "WhatsApp / App notifications",
      "Reservation management",
      "Customer Leaderboard",
      "Product catalogue & ordering",
      "NFC-based loyalty (tap-to-earn)",
    ],
    buttonText: "Get Started",
    href: "/login",
    badge: "RECOMMENDED",
    badgeClass: "bg-green-600 text-white",
    showStar: true,
    cardClass: "border-green-500 shadow-lg",
  },
  {
    id: "plus",
    name: "Plus Plan",
    description: "For brands operating multiple outlets or locations.",
    isCustom: true,
    features: [
      "All Growth features",
      "Multi-outlet management",
      "Outlet-wise data segregation",
      "Outlet performance tracking",
      "Centralized admin dashboard",
      "Comparative outlet reporting",
      "Role-based access control",
    ],
    buttonText: "Contact Sales",
    href: "https://wa.me/9779843742684",
    isExternal: true,
    badge: "MULTI-OUTLET",
    badgeClass: "bg-gray-900 text-white",
    cardClass: "border-gray-900 shadow-lg",
  },
];

export function NewPricing() {
  // 0: Monthly  1: Quarterly  2: Annually
  const [cycle, setCycle] = useState(1);

  // Geo pricing — defaults to GLOBAL on first render (no flicker, SEO-safe)
  const { pricing, loading } = useGeoPricing();

  const handleCycleChange = (index) => {
    setCycle(index);
    if (index === 2) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#BDE3C3", "#9DD9A5", "#A3CCDA", "#85B8C9"],
      });
    }
  };

  /** Returns the numeric price (or sentinel string) for a given plan + cycle */
  const getPrice = (plan) => {
    if (plan.isFree) return "Free";
    if (plan.isCustom) return "Custom";
    if (cycle === 0) return pricing.plans.monthly;
    if (cycle === 1) return pricing.plans.quarterly;
    return pricing.plans.yearly;
  };

  const getPeriod = () => {
    if (cycle === 0) return "month";
    if (cycle === 1) return "quarter";
    return "year";
  };

  return (
    <div className="w-full bg-[#F6F4F7] py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Samparka Loyalty System Pricing
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Scale your business with our flexible digital loyalty solutions.
          </p>
        </div>

        {/* Auto-detected region label */}
        {/* <div className="flex justify-center mb-10">
          <p className="text-sm text-gray-400">
            Showing pricing for {pricing.region} {pricing.flag}
          </p>
        </div> */}

        {/* 3-Way billing toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-gray-200/50 p-1 rounded-xl flex items-center gap-1">
            {["Monthly", "Quarterly", "Annually"].map((label, i) => (
              <button
                key={label}
                onClick={() => handleCycleChange(i)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  cycle === i
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLAN_METADATA.map((plan, index) => {
            const price = getPrice(plan);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative p-8 rounded-3xl bg-white border-2 transition-all duration-300 flex flex-col h-full",
                  plan.cardClass
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className={cn(
                      "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1",
                      plan.badgeClass
                    )}
                  >
                    {plan.showStar && <Star className="w-3 h-3 fill-current" />}
                    {plan.badge}
                  </div>
                )}

                {/* Plan name + description */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Price block — fades slightly while geo-detection is in flight */}
                <div
                  className="mb-8 transition-opacity duration-500"
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  {price === "Free" ? (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-black">FREE</span>
                        <span className="text-gray-500 font-medium">/ {plan.duration}</span>
                      </div>
                      <span className="text-black text-xs font-bold mt-2">
                        No credit card required
                      </span>
                    </div>
                  ) : price === "Custom" ? (
                    <div className="h-15 flex items-center">
                      <span className="text-3xl font-bold text-gray-900">Custom Quote</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 font-bold">{pricing.symbol}</span>
                        <span className="text-5xl font-black text-gray-900">
                          <NumberFlow
                            value={price}
                            format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                            transformTiming={{ duration: 500, easing: "ease-out" }}
                            willChange
                          />
                        </span>
                        <span className="text-gray-500 font-medium">/{getPeriod()}</span>
                      </div>
                      {cycle === 2 && (
                        <span className="text-gray-900 text-xs font-bold mt-2 uppercase tracking-tighter">
                          {pricing.saveText}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Feature list */}
                <ul className="space-y-4 mb-10 grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 shrink-0 text-gray-900" />
                      <span className="text-gray-600 text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.href}
                  {...(plan.isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full py-6 rounded-xl font-bold text-lg border-2 transition-all text-white hover:text-white",
                    "border-gray-900 bg-gray-900 hover:bg-gray-800 hover:border-gray-800"
                  )}
                >
                  {plan.buttonText}
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default NewPricing;
