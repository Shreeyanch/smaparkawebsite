import { useEffect, useState } from "react";
import { useStoreAuth } from "../context/StoreAuthContext";

const Greeting = () => {
  const textConfig = {
    greetingInterval: 2000,
    fontColor: "text-black",
    pointsLabel: "Points",
  };

  const greetings = [
    "Namaste!",
    "Jwojwolapa!",
    "Sewaro!",
    "Tashi Delek!",
    "Hello!",
  ];
  const [greeting, setGreeting] = useState(greetings[0]);

  const { authState } = useStoreAuth();
  const { userInfo: user } = authState;

  // Memoize the user object to avoid unnecessary re-renders of CustomerQr

  useEffect(() => {
    let index = 0;
    setGreeting(greetings[index]);

    const interval = setInterval(() => {
      index = (index + 1) % greetings.length;
      setGreeting(greetings[index]);
    }, textConfig.greetingInterval);

    return () => clearInterval(interval);
  }, [textConfig.greetingInterval]);

  return (
    <div className="h-[80px] w-full">
      <div className="left-0 mr-[140px] flex flex-col items-start justify-start box-border font-rubik">
        <div className="flex tracking-[0.01em] text-black w-[50px] text-lg text-nowrap">
          <span className="font-medium text-nowrap">{greeting}</span>
          <span className="font-medium font-Poppins">👋</span>
        </div>
        <div className="tracking-[0.01em] font-semibold font-poppins mt-[-5px] text-sm flex gap-4 items-center">
          <span className="text-nowrap mt-2">{user?.name}</span>
        </div>
      </div>
      {/* Only render CustomerQr when the modal is open */}
    </div>
  );
};

export default Greeting;
