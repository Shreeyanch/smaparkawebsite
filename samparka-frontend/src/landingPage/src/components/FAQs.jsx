import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm cursor-pointer transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-center p-5">
        <span className="text-gray-800 font-medium text-lg">{question}</span>
        <span className="text-black text-2xl font-light ml-4 flex-shrink-0">
          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
        </span>
      </div>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 pb-5 text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0)

  const faqsLeft = [
    {
      question: "What is Samparka?",
      answer: "Samparka is a leading loyalty and customer engagement platform that helps restaurants, cafes, bars, retail stores, and service businesses increase repeat customers and grow revenue through smart marketing automation, loyalty programs, and customer insights."
    },
    {
      question: "Who can use Samparka?",
      answer: "Samparka is designed for restaurants, cafes, retail stores, salons, spas, and any business that wants to build lasting customer relationships through loyalty programs and targeted marketing campaigns."
    },
    {
      question: "How long does it take to get started with Samparka?",
      answer: "You can get started with Samparka in just a few minutes! Simply create an account, set up your store, customize your loyalty program, and you're ready to start engaging with your customers."
    },
    {
      question: "What types of campaigns can Samparka help me build?",
      answer: "Samparka supports SMS campaigns, WhatsApp marketing, email campaigns, push notifications, and automated triggered campaigns based on customer behavior like birthdays, inactivity, or purchase milestones."
    }
  ]

  const faqsRight = [
    {
      question: "How does the loyalty program work?",
      answer: "Customers earn points on every purchase which they can redeem for rewards. You can customize point earning rates, create tiered loyalty levels, and set up various reward options to keep customers coming back."
    },
    {
      question: "Can I customize my marketing campaigns?",
      answer: "Absolutely! You can create fully customized campaigns with your own messaging, targeting specific customer segments based on their purchase history, visit frequency, tier level, and more."
    },
    {
      question: "Does Samparka integrate with POS systems?",
      answer: "Yes, Samparka can integrate with various POS systems and also provides a standalone solution that works independently through our web app and QR code system."
    },
    {
      question: "Is any special hardware required?",
      answer: "No special hardware is required! Samparka works entirely through our web-based platform. All you need is a device with internet access to manage your loyalty program and campaigns."
    }
  ]

  const allFaqs = [...faqsLeft, ...faqsRight]

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className=" bg-[#F6F4F7] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-gray-800  text-5xl font-bold text-center mb-12">FAQ</h2>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {faqsLeft.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => handleClick(index)}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {faqsRight.map((faq, index) => (
              <FAQItem
                key={index + faqsLeft.length}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index + faqsLeft.length}
                onClick={() => handleClick(index + faqsLeft.length)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQs