const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const GreetingSection = ({
  customerName = "Guest",
  subtitle = "ready for your next journey?",
  textColor = "#ffffff",
}) => {
  return (
    <div className="w-full pr-20" style={{ color: textColor }}>
      <p className="text-sm font-light" style={{ opacity: 0.85 }}>
        {getTimeGreeting()},
      </p>
      <p
        className="font-semibold leading-tight mt-1"
        style={{ fontSize: "28px", letterSpacing: "-0.3px" }}
      >
        Hi {customerName},
      </p>
      <p className="text-sm mt-1.5 font-light" style={{ opacity: 0.55 }}>
        {subtitle}
      </p>
    </div>
  );
};

export default GreetingSection;
