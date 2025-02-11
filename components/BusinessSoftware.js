import React, { useState } from "react";
import styles from "./BusinessSoftware.module.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import SlotMachine from "./SlotMachine";

// Register the chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BusinessSoftware = () => {
  const [popupContent, setPopupContent] = useState(null);

  const handleCardClick = (title, description, image, extraInfo) => {
    setPopupContent({ title, description, image, extraInfo });
  };

  const closePopup = () => {
    setPopupContent(null);
  };

  // Sample leaderboard data
  const leaderboardData = [
    { name: "Alice", points: 80, rank: 1 },
    { name: "Bob", points: 70, rank: 2 },
    { name: "Charlie", points: 60, rank: 3 },
  ];

  // Analytics Chart Data
  const data = {
    labels: ["January", "February", "March", "April", "May"], // X-axis labels
    datasets: [
      {
        label: "Revenue ($)",
        data: [400, 300, 500, 700, 600], // Y-axis data
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Revenue Analytics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>All-In-One Business Software</h2>
      <p className={styles.subHeading}>
        Boost productivity using our WhatsApp-first ERP software for small businesses
      </p>

      <div className={styles.grid}>
        {/* Seamless Reservation Card */}
        <div
          className={styles.card}
          onClick={() =>
            handleCardClick(
              "Seamless Reservation",
              "Effortlessly book your table, haircut, or any other service in advance with Samparka.",
              "./reservation.png",
              "🔹 Book with ease \n🔹 Avoid long wait times \n🔹 Get instant confirmation"
            )
          }
        >
          <h3>Seamless Reservation</h3>
          <p>Effortlessly book your table, haircut, or any other service in advance with Samparka.</p>
          <img src="./reservation.png" alt="Seamless Reservation" className={styles.cardImage} />
        </div>

        {/* Notification Card */}
        <div
          className={styles.card}
          onClick={() =>
            handleCardClick(
              "Notification",
              "Stay updated with real-time notifications for bookings, payments, and more.",
              "./notification.png",
              "🔹 Receive instant alerts \n🔹 Customizable notifications \n🔹 Boost customer engagement"
            )
          }
        >
          <h3>Notification</h3>
          <p>Stay updated with real-time notifications for bookings, payments, and more.</p>
          <img src="./notification.png" alt="notification" className={styles.cardImageNotification} />
        </div>

        {/* Leaderboard Card */}
        <div
          className={styles.card}
          onClick={() =>
            handleCardClick(
              "Leaderboard",
              "Encourage friendly competition with a leaderboard for your customers.",
              null,
              "🔹 Track top customers \n🔹 Reward loyal customers \n🔹 Foster community engagement"
            )
          }
        >
          <h3>Leaderboard</h3>
          <p>Encourage friendly competition with a leaderboard for your customers.</p>

          {/* Leaderboard Section */}
          <div className={styles.leaderboard}>
            {leaderboardData.map((user) => (
              <div key={user.rank} className={styles.leaderboardItem}>
                <div className={styles.rank}>
                  <span>{user.rank}</span>
                  {user.rank === 1 && <img src="./trophy.png" alt="Trophy" className={styles.trophy} />}
                </div>
                <div className={styles.userInfo}>
                  <p>{user.name}</p>
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${user.points}%` }}
                    ></div>
                    <span className={styles.points}>{user.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Card */}
        <div
          className={styles.card}
          onClick={() =>
            handleCardClick(
              "Analytics",
              "Visitors and business insights.",
              null,
              "🔹 Track customer behavior \n🔹 Monitor revenue trends \n🔹 Get data-driven insights"
            )
          }
        >
          <h3>Analytics</h3>
          <p>Visitors and business insights</p>
          <div className={styles.chartContainer}>
            <Bar data={data} options={options} />
          </div>
        </div>

        {/* Other cards here */}
        <div
          className={styles.card}
          onClick={() =>
            handleCardClick(
              "Online Store",
              "Launch your own online store with ease and sell products directly.",
              "./slot.svg", 
              "🔹 Set up an online catalog \n🔹 Accept payments online \n🔹 Integrate with existing services"
            )
          }
        >
          <h3>Online Store</h3>
          <p>Launch your own online store with ease and sell products directly.</p>
        </div>

        <div
  className={styles.card}
  onClick={() =>
    handleCardClick(
      "Gamification",
      "Make your business more engaging with gamified features.",
      "./slot.svg",  // Assuming this is the image path
      "🔹 Earn rewards for completing tasks \n🔹 Fun challenges for customers \n🔹 Increase engagement"
    )
  }
>
  <div className={styles.cardContent}>
    <div className={styles.textContent}>
      <h3>Gamification</h3>
      <p>Make your business more engaging with gamified features.</p>
    </div>
    <div className={styles.imageContent}>
      <SlotMachine />
    </div>
  </div>
</div>

      </div>

      {/* Popup */}
      {popupContent && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closePopup}>
              ✖
            </button>
            <h3>{popupContent.title}</h3>
            <p>{popupContent.description}</p>
            {popupContent.image && <img src={popupContent.image} alt={popupContent.title} className={styles.popupImage} />}
            {popupContent.extraInfo && (
              <p className={styles.extraInfo}>{popupContent.extraInfo.split("\n").map((item, index) => (
                <span key={index}>{item}<br/></span>
              ))}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSoftware;
