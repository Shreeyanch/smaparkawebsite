import React, { useState, useEffect } from "react";
import styles from "./BusinessSoftware.module.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";



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
    { name: "Shreejita Shrestha", points: 80, rank: 1 },
    { name: "Swikriti Pradhan", points: 70, rank: 2 },
    { name: "Sampada Khadka", points: 60, rank: 3 },
  ];

  // Analytics Chart Data
  const data = {
    labels: ["January", "February", "March", "April", "May"], // X-axis labels
    datasets: [
      {
        label: "Customer Visits",
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
        text: "Customer Analytics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Fruit Spin logic
  const [fruitIndex, setFruitIndex] = useState(0); // For controlling fruit animation index

  const fruits = ["🍎", "🍌", "🍒", "🍊", "🍇","🍉"]; // List of fruits for the slot machine

  // Slot machine logic
  useEffect(() => {
    const interval = setInterval(() => {
      setFruitIndex((prevIndex) => (prevIndex + 1) % fruits.length); // Cycle through fruits
    }, 300); // Change fruit every 300ms (adjust speed)

    // Stop after 10 seconds (you can adjust this)
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);


  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>More about features</h2>
      <p className={styles.subHeading}>
      More than just loyalty—Samparka connects, rewards, and delights!      </p>

      <div className={styles.grid}>
        {/* Seamless Reservation Card */}
        <div
  className={styles.card}
  onClick={() =>
    handleCardClick(
      "Seamless Reservation",
      "Add a reservation feature to your loyalty card with Samparka. Your customers can directly reserve services, while you stay in control and notified in real-time.",
      "./reservationsmall.png",
      `
      <table style="width:100%; text-align: left; margin-top: 10px;">
        <tr>
          <td >✅ Quick & Easy</td>
          <td >Customers reserve directly via loyalty card.</td>
        </tr>
        <tr>
          <td >🔔 Customer Notifications</td>
          <td >Instant booking confirmations and reminders.</td>
        </tr>
        <tr>
          <td >📲 Admin Notifications</td>
          <td >Admins are notified of new bookings instantly.</td>
        </tr>
        <tr>
          <td >☁️ Admin Confirmation</td>
          <td >Admins can confirm bookings via the cloud panel.</td>
        </tr>
      </table>
      <h4>Who can use this?</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>💇‍♂️ Hair Salons</div>
        <div>💅 Beauty Parlors</div>
        <div>🍽️ Restaurants</div>
        <div>💆‍♀️ Spas</div>
        <div>🏨 Hotels</div>
        <div>🎮 Gaming Centers</div>
        <div>💼 Event Planners</div>
        <div>🏋️‍♂️ Fitness Centers</div>
        <div>🏌️‍♂️ Golf Courses</div>
      </div>
      `
    )
  }
>
  <h3>Seamless Reservation</h3>
  <p>Add a reservation feature to your loyalty card with Samparka. Your customers can directly reserve services, while you stay in control and notified in real-time.</p>
  <img src="./reservation.png" alt="Seamless Reservation" className={styles.cardImage} />
</div>



        {/* Notification Card */}
        <div
  className={styles.card}
  onClick={() =>
    handleCardClick(
      "Notification",
      "Engage your customers with real-time notifications.",
      "./notification.png",
      `
      <table style="width:100%; text-align: left; margin-top: 10px;">
        <tr>
          <td style="padding: 8px;">📧 Email Automation</td>
          <td style="padding: 8px;">Send notifications via SMTP integration.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">📱 SMS Automation</td>
          <td style="padding: 8px;">SMS alerts via your own SMS API integration (connect your SMS account to Samparka).</td>
        </tr>
        <tr>
          <td style="padding: 8px;">📲 App Notifications</td>
          <td style="padding: 8px;">Notifications sent via PWA management to keep customers engaged.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">⚙️ Automation Triggers</td>
          <td style="padding: 8px;">Send automated alerts for: 
            <ul>
              <li>Points earned</li>
              <li>Rewards received</li>
              <li>Google review reminder</li>
              <li>Special offers</li>
              <li>Birthday offers</li>
              <li>Seasonal promotions</li>
            </ul>
          </td>
        </tr>
      </table>
      `
    )
  }
>
  <h3>Notification</h3>
  <p>Stay updated with real-time notifications for bookings, payments, and more.</p>
  <img src="./notification.png" alt="Notification" className={styles.cardImageNotification} />
</div>


        {/* Leaderboard Card */}
        <div
  className={styles.card}
  onClick={() =>
    handleCardClick(
      "Leaderboard",
      "Encourage friendly competition with a leaderboard for your customers.",
      "./leaderboard.png",
      `
      <table style="width:100%; text-align: left; margin-top: 10px;">
        <tr>
          <td style="padding: 8px;">🏆 Top Rankings</td>
          <td style="padding: 8px;">Reward the top 3 customers for their engagement and loyalty.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">🔝 Track Progress</td>
          <td style="padding: 8px;">Monitor customer points and milestones in real-time.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">🎮 Gamify Experience</td>
          <td style="padding: 8px;">Create a fun and engaging environment through competition.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">💬 Social Sharing</td>
          <td style="padding: 8px;">Let users share their rankings and achievements on social media.</td>
        </tr>

      </table>
      `
    )
  }
>
  <h3 className={styles.cardTitle}>Leaderboard</h3>
  <p className={styles.cardDescription}>Encourage friendly competition with a leaderboard for your customers.</p>

  {/* Leaderboard Section */}
  <div className={styles.leaderboard}>
    {leaderboardData.map((user) => (
      <div key={user.rank} className={styles.leaderboardItem}>
        <div className={styles.rankContainer}>
          <span className={styles.rank}>{user.rank}</span>
          {user.rank === 1 && <span className={styles.trophy}>🏆</span>}
          {user.rank === 2 && <span className={styles.medal}>🥈</span>}
          {user.rank === 3 && <span className={styles.medal}>🥉</span>}
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.name}</p>
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
      "/analytics.png",
      `
      <table style="width:100%; text-align: left; margin-top: 10px;">
        <tr>
          <td style="padding: 8px;">📊 Customer Insights</td>
          <td style="padding: 8px;">Track how users engage with your platform.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">🧑‍🤝‍🧑 Customer Demographics</td>
          <td style="padding: 8px;">Analyze customer behavior based on demographic data.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">👥 Customer Database</td>
          <td style="padding: 8px;">Manage and segment customer information effectively.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">💸 Rewards Expenditure</td>
          <td style="padding: 8px;">Track how customers spend their loyalty points on rewards.</td>
        </tr>
        <tr>
          <td style="padding: 8px;">📆 Track Reservation/Orders </td>
          <td style="padding: 8px;">Track Reservation/Orders Effectively.</td>
        </tr>
      </table>
      `
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
              "Add your online store, digital menu, and service menu, with preorder options all in one place.",

              "./as.png", 
              `
              <table className={styles.featuresTable}>
        <tbody>
          <tr>
            <td>🛒 Add & Manage Your Online Store</td>
          </tr>
          <tr>
            <td>🍽️ Display a Digital Menu for Services</td>
          </tr>
          <tr>
            <td>📅 Offer Preorder Options for Convenience</td>
          </tr>
          <tr>
            <td>📦 Track Orders from Cloud Dashboard</td>
          </tr>
          <tr>
            <td>💬 Customer enquiry and bills via Whatsapp</td>
          </tr>
        </tbody>
      </table>`
            )
          }
        >
          <h3>Online Store</h3>
          <p> Add your online store, digital menu, and service menu, with preorder options all in one place.
          </p>
          <div class="cardImageContainer">
          <img src="./as.png" alt="Seamless Reservation" className={styles.storecardImage} />

          </div>

        </div>

        <div
  className={styles.card}
  onClick={() =>
    handleCardClick(
      "Gamification",
      "Make your business more engaging with gamified features.",
      "./slot.svg",  // Assuming this is the image path
      `
      <table className={styles.featuresTable}>
        <tbody>
          <tr>
            <td>🎮 Fun challenges for customers</td>
          </tr>
          <tr>
            <td>🎯 Set winning probability</td>
          </tr>
          <tr>
            <td>🎰 Edit game icons</td>
          </tr>
          <tr>
            <td>📈 Increase engagement</td>
          </tr>
        </tbody>
      </table>

     
      `
    )
  }
>
  <div className={styles.cardWrapper}>
    <div className={styles.cardContentWrapper}>
      <div className={styles.leftTextContent}>
        <h3>Gamification</h3>
        <p>Make your business more engaging with gamified features.</p>
      </div>
      <div className={styles.rightTableContent}>
        <div className={styles.slotMachine}>
          <div className={styles.slotContainer}>
            {fruits.slice(0, 3).map((fruit, index) => (
              <div
                key={index}
                className={`${styles.slotItem} ${fruitIndex === index ? styles.active : ""}`}
              >
                <div className={styles.fruit}>{fruits[(index + 1) % fruits.length]}</div>
                <div className={styles.fruit}>{fruits[(index + 2) % fruits.length]}</div>
                <div className={styles.fruit}>{fruits[(index + 3) % fruits.length]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
              <div className={styles.popupContent}>
                {/* Left Side - Text Content */}
                <div className={styles.popupText}>
                  <h3>{popupContent.title}</h3>
                  <p>{popupContent.description}</p>
                  {popupContent.extraInfo && (
                    <div
                      className={styles.extraInfo}
                      dangerouslySetInnerHTML={{ __html: popupContent.extraInfo }}
                    />
                  )}
                </div>

                {/* Right Side - Image */}
                {popupContent.image && (
                  <div className={styles.popupImageContainer}>
                    <img src={popupContent.image} alt={popupContent.title} className={styles.popupImage} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default BusinessSoftware;
