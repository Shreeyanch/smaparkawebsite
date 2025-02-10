import React from "react";
import styles from "./BusinessSoftware.module.css";

const BusinessSoftware = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>All-In-One Business Software</h2>
      <p className={styles.subHeading}>
        Boost productivity using our WhatsApp-first ERP software for small businesses
      </p>

      <div className={styles.grid}>
        {/* CRM Card */}
        <div className={styles.card}>
          <h3>Seamless Reservation</h3>
          <p>Effortlessly book your table, haircut, or any other service in advance with Samparka. </p>
          <img 
           src="./reservation.png" 
            alt="Seamless Reservation" 
            className={styles.cardImage} 
          />
          
          
        </div>

      

        {/* Inventory Card */}
        <div className={styles.card}>
          <h3>Inventory</h3>
          <p>Manage inventory online and prevent overselling/shortages</p>
          <ul className={styles.inventoryList}>
            <li><span>Journal</span><span>2</span><span>$15.00</span></li>
            <li><span>Lipstick</span><span>2</span><span>$9.99</span></li>
            <li><span>T-shirts</span><span>10</span><span>$10.99</span></li>
            <li><span>Candle</span><span>10</span><span>$12.99</span></li>
          </ul>
        </div>

        {/* Wholesale Card */}
        <div className={styles.card}>
          <h3>Wholesale</h3>
          <p>Boost sales with personalized pricing for customers</p>
          <div className={styles.wholesale}>
            <p><strong>Regular user</strong>: Handcream - $15.00</p>
            <p><strong>VIP user</strong>: Handcream - <span className={styles.discount}>$10.00</span> <s>$15.00</s></p>
          </div>
        </div>

        {/* Analytics Card */}
        <div className={styles.card}>
          <h3>Analytics</h3>
          <p>Visitors and business insights</p>
          <div className={styles.analytics}>
            <p>👥 <strong>1500 visitors</strong></p>
          </div>
        </div>

        {/* Payment Link Card */}
        <div className={styles.card}>
          <h3>Payment Link</h3>
          <p>Get paid faster for Accounts Receivable</p>
          <div className={styles.card}>
          <h3>Seamless Reservation</h3>
          <p>Effortlessly book your table, haircut, or any other service in advance with Samparka. </p>
          <img 
    src="./reservation.png" 
    alt="Seamless Reservation" 
    className={styles.cardImage} 
  />
          </div>
        </div>

        {/* Membership Card */}
        <div className={styles.card}>
          <h3>Membership</h3>
          <p>Incentivize repeat purchases with reward credit</p>
          <div className={styles.rewards}>
            <p>Enable rewards:</p>
            <input type="checkbox" />
            <p>10%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSoftware;
