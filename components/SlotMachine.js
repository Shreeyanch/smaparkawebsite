import React, { useState, useEffect } from "react";
import "./SlotMachine.module.css";

const SlotMachine = () => {
  const [spin, setSpin] = useState(false);
  const [slot1, setSlot1] = useState("🍎");
  const [slot2, setSlot2] = useState("🍌");
  const [slot3, setSlot3] = useState("🍉");

  const items = ["🍎", "🍌", "🍉", "🍊", "🍍", "🍓", "🍒", "🍉"];

  const startSpin = () => {
    setSpin(true);
    setTimeout(() => {
      setSlot1(items[Math.floor(Math.random() * items.length)]);
      setSlot2(items[Math.floor(Math.random() * items.length)]);
      setSlot3(items[Math.floor(Math.random() * items.length)]);
      setSpin(false); // Stop the spin after the set duration
    }, 3000); // Spin duration (3 seconds)
  };

  useEffect(() => {
    if (!spin) {
      return;
    }
    const interval = setInterval(() => {
      setSlot1(items[Math.floor(Math.random() * items.length)]);
      setSlot2(items[Math.floor(Math.random() * items.length)]);
      setSlot3(items[Math.floor(Math.random() * items.length)]);
    }, 100); // Spins every 100ms

    return () => clearInterval(interval);
  }, [spin]);

  return (
    <div className="slot-machine-container">
      <div className="slot-machine">
        <div className="slots">
          <div className={`slot ${spin ? "spinning" : ""}`}>{slot1}</div>
          <div className={`slot ${spin ? "spinning" : ""}`}>{slot2}</div>
          <div className={`slot ${spin ? "spinning" : ""}`}>{slot3}</div>
        </div>
        <div className="handle" onClick={startSpin}></div>
      </div>
    </div>
  );
};

export default SlotMachine;
