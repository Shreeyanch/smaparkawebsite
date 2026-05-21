/**
 * Database Seed Script
 * Populates the development database with dummy data
 *
 * Usage: yarn seed (or npm run seed)
 */

require("dotenv/config");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { getDatabaseConfig } = require("../config/database");

// Import all models
const User = require("../models/userModel");
const Store = require("../models/storeModel");
const Customer = require("../models/customerModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Reward = require("../models/rewardModel");
const Points = require("../models/pointsModel");
const PointsHistory = require("../models/pointsHistoryModel");
const Redemption = require("../models/redemptionModel");
const Outlet = require("../models/outletModel");
const Offer = require("../models/offerModel");
const Reservation = require("../models/reservationModel");
const ReservationSetting = require("../models/reservationSettingModel");
const WheelSegment = require("../models/wheelSegment");
const Notification = require("../models/notificationModel");
const MailSMS = require("../models/mailSMSModel");

// ============================================
// DUMMY DATA
// ============================================

const createDummyData = async () => {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Store.deleteMany({}),
    Customer.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Order.deleteMany({}),
    Reward.deleteMany({}),
    Points.deleteMany({}),
    PointsHistory.deleteMany({}),
    Redemption.deleteMany({}),
    Outlet.deleteMany({}),
    Offer.deleteMany({}),
    Reservation.deleteMany({}),
    ReservationSetting.deleteMany({}),
    WheelSegment.deleteMany({}),
    Notification.deleteMany({}),
    MailSMS.deleteMany({}),
  ]);
  console.log("✅ Existing data cleared\n");

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await User.insertMany([
    {
      email: "admin@samparka.co",
      password: hashedPassword,
      role: "admin",
      status: "active",
    },
    {
      email: "store1@test.com",
      password: hashedPassword,
      role: "user",
      status: "active",
    },
    {
      email: "store2@test.com",
      password: hashedPassword,
      role: "user",
      status: "active",
    },
    {
      email: "subadmin@test.com",
      password: hashedPassword,
      role: "subadmin",
      status: "active",
    },
  ]);
  console.log(`✅ Created ${users.length} users\n`);

  // ============================================
  // 2. CREATE STORES
  // ============================================
  console.log("🏪 Creating stores...");
  const stores = await Store.insertMany([
    {
      name: "Grinders Coffee",
      location: "Thamel, Kathmandu",
      phone: "9841234567",
      logo: "https://via.placeholder.com/150/8B4513/FFFFFF?text=GC",
      frontLogo: "https://via.placeholder.com/300/8B4513/FFFFFF?text=Grinders",
      url: "grinders-coffee",
      type: "food",
      status: "active",
      needCustomerDOB: true,
      needCustomerGender: true,
      givePointsOnRegister: true,
      amount: true,
      conversionRate: "100",
      pointValue: "1",
      lat: 27.7172,
      lng: 85.324,
      email: "grinders@test.com",
      loyaltyCard: {
        format: "L2",
        totalShapes: 10,
        stampColor: "#8B4513",
        cardColor: "#F5DEB3",
        textColor: "#000000",
        stampShape: "circle",
        tier: [
          { name: "Bronze", minPoints: 0, maxPoints: 100, color: "#CD7F32" },
          { name: "Silver", minPoints: 101, maxPoints: 300, color: "#C0C0C0" },
          { name: "Gold", minPoints: 301, maxPoints: 1000, color: "#FFD700" },
        ],
      },
      services: {
        loyalty: true,
        reservation: true,
        ecommerce: {
          status: true,
          storeDescription: "Premium coffee and pastries",
          deliveryCharge: 100,
        },
        games: true,
        multipleOutlets: true,
        leaderboard: true,
        onGoingOffers: true,
      },
      user: [users[1]._id],
    },
    {
      name: "Fashion Hub",
      location: "New Road, Kathmandu",
      phone: "9851234567",
      logo: "https://via.placeholder.com/150/4169E1/FFFFFF?text=FH",
      frontLogo: "https://via.placeholder.com/300/4169E1/FFFFFF?text=Fashion",
      url: "fashion-hub",
      type: "retail",
      status: "active",
      needCustomerDOB: false,
      needCustomerGender: true,
      givePointsOnRegister: true,
      amount: true,
      conversionRate: "500",
      pointValue: "1",
      lat: 27.7049,
      lng: 85.3138,
      email: "fashion@test.com",
      loyaltyCard: {
        format: "L3",
        totalShapes: 8,
        stampColor: "#4169E1",
        cardColor: "#E6E6FA",
        textColor: "#000000",
        stampShape: "star",
        tier: [
          { name: "Member", minPoints: 0, maxPoints: 200, color: "#808080" },
          { name: "VIP", minPoints: 201, maxPoints: 500, color: "#FFD700" },
          {
            name: "Platinum",
            minPoints: 501,
            maxPoints: 2000,
            color: "#E5E4E2",
          },
        ],
      },
      services: {
        loyalty: true,
        reservation: false,
        ecommerce: {
          status: true,
          storeDescription: "Trendy fashion for everyone",
          deliveryCharge: 150,
        },
        games: false,
        multipleOutlets: false,
        leaderboard: true,
        onGoingOffers: true,
      },
      user: [users[2]._id],
    },
    {
      name: "Spa Bliss",
      location: "Lazimpat, Kathmandu",
      phone: "9861234567",
      logo: "https://via.placeholder.com/150/DDA0DD/FFFFFF?text=SB",
      frontLogo: "https://via.placeholder.com/300/DDA0DD/FFFFFF?text=SpaBliss",
      url: "spa-bliss",
      type: "service",
      status: "active",
      needCustomerDOB: true,
      needCustomerGender: true,
      givePointsOnRegister: false,
      amount: false,
      conversionRate: "1",
      pointValue: "1",
      lat: 27.7215,
      lng: 85.3246,
      email: "spa@test.com",
      loyaltyCard: {
        format: "L1",
        totalShapes: 6,
        stampColor: "#DDA0DD",
        cardColor: "#FFF0F5",
        textColor: "#000000",
        stampShape: "heart",
        tier: [
          { name: "Guest", minPoints: 0, maxPoints: 50, color: "#FFB6C1" },
          { name: "Regular", minPoints: 51, maxPoints: 150, color: "#FF69B4" },
          { name: "Premium", minPoints: 151, maxPoints: 500, color: "#FF1493" },
        ],
      },
      services: {
        loyalty: true,
        reservation: true,
        ecommerce: { status: false },
        games: false,
        multipleOutlets: true,
        leaderboard: false,
        onGoingOffers: true,
      },
      user: [users[1]._id],
    },
  ]);
  console.log(`✅ Created ${stores.length} stores\n`);

  // ============================================
  // 3. CREATE OUTLETS
  // ============================================
  console.log("📍 Creating outlets...");
  const outlets = await Outlet.insertMany([
    {
      location: "Thamel Main Branch",
      store: stores[0]._id,
      phone: "9841234567",
      mapLink: "https://maps.google.com/?q=27.7172,85.324",
    },
    {
      location: "Durbar Marg Branch",
      store: stores[0]._id,
      phone: "9841234568",
      mapLink: "https://maps.google.com/?q=27.7145,85.3188",
    },
    {
      location: "Lazimpat Main",
      store: stores[2]._id,
      phone: "9861234567",
      mapLink: "https://maps.google.com/?q=27.7215,85.3246",
    },
    {
      location: "Boudha Branch",
      store: stores[2]._id,
      phone: "9861234568",
      mapLink: "https://maps.google.com/?q=27.7215,85.3615",
    },
  ]);

  // Update stores with outlet references
  await Store.findByIdAndUpdate(stores[0]._id, {
    outlets: [outlets[0]._id, outlets[1]._id],
  });
  await Store.findByIdAndUpdate(stores[2]._id, {
    outlets: [outlets[2]._id, outlets[3]._id],
  });
  console.log(`✅ Created ${outlets.length} outlets\n`);

  // ============================================
  // 4. CREATE CUSTOMERS
  // ============================================
  console.log("👥 Creating customers...");
  const customers = await Customer.insertMany([
    // Grinders Coffee customers
    {
      name: "Ram Sharma",
      email: "ram@test.com",
      countryCode: "+977",
      phone: 9801111111,
      dob: new Date("1990-05-15"),
      gender: "male",
      tier: "Bronze",
      totalPoints: 50,
      points: 50,
      store: stores[0]._id,
    },
    {
      name: "Sita Thapa",
      email: "sita@test.com",
      countryCode: "+977",
      phone: 9802222222,
      dob: new Date("1995-08-20"),
      gender: "female",
      tier: "Silver",
      totalPoints: 150,
      points: 120,
      store: stores[0]._id,
    },
    {
      name: "Hari Prasad",
      email: "hari@test.com",
      countryCode: "+977",
      phone: 9803333333,
      dob: new Date("1988-12-10"),
      gender: "male",
      tier: "Gold",
      totalPoints: 500,
      points: 350,
      store: stores[0]._id,
    },
    {
      name: "Gita Rai",
      email: "gita@test.com",
      countryCode: "+977",
      phone: 9804444444,
      dob: new Date("1992-03-25"),
      gender: "female",
      tier: "Bronze",
      totalPoints: 25,
      points: 25,
      store: stores[0]._id,
    },
    // Fashion Hub customers
    {
      name: "Binod KC",
      email: "binod@test.com",
      countryCode: "+977",
      phone: 9805555555,
      gender: "male",
      tier: "Member",
      totalPoints: 100,
      points: 80,
      store: stores[1]._id,
    },
    {
      name: "Anita Gurung",
      email: "anita@test.com",
      countryCode: "+977",
      phone: 9806666666,
      gender: "female",
      tier: "VIP",
      totalPoints: 350,
      points: 250,
      store: stores[1]._id,
    },
    // Spa Bliss customers
    {
      name: "Maya Tamang",
      email: "maya@test.com",
      countryCode: "+977",
      phone: 9807777777,
      dob: new Date("1985-07-08"),
      gender: "female",
      tier: "Regular",
      totalPoints: 80,
      points: 60,
      store: stores[2]._id,
    },
    {
      name: "Sunita Lama",
      email: "sunita@test.com",
      countryCode: "+977",
      phone: 9808888888,
      dob: new Date("1993-11-30"),
      gender: "female",
      tier: "Premium",
      totalPoints: 200,
      points: 180,
      store: stores[2]._id,
    },
  ]);
  console.log(`✅ Created ${customers.length} customers\n`);

  // ============================================
  // 5. CREATE CATEGORIES
  // ============================================
  console.log("📂 Creating categories...");
  const categories = await Category.insertMany([
    {
      name: ["Coffee", "Tea", "Pastries", "Snacks", "Cold Drinks"],
      store: stores[0]._id,
    },
    {
      name: ["Men", "Women", "Kids", "Accessories", "Footwear"],
      store: stores[1]._id,
    },
    {
      name: ["Massage", "Facial", "Hair", "Nails", "Packages"],
      store: stores[2]._id,
    },
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================
  // 6. CREATE PRODUCTS
  // ============================================
  console.log("📦 Creating products...");
  const products = await Product.insertMany([
    // Grinders Coffee products
    {
      name: "Americano",
      images: ["https://via.placeholder.com/300/8B4513/FFFFFF?text=Americano"],
      description: "Classic black coffee with rich flavor",
      price: 250,
      discountRate: 0,
      calculatedPrice: 250,
      category: "Coffee",
      stock: null,
      trackStock: false,
      storeId: stores[0]._id,
    },
    {
      name: "Cappuccino",
      images: ["https://via.placeholder.com/300/8B4513/FFFFFF?text=Cappuccino"],
      description: "Espresso with steamed milk foam",
      price: 300,
      discountRate: 10,
      calculatedPrice: 270,
      category: "Coffee",
      stock: null,
      trackStock: false,
      storeId: stores[0]._id,
    },
    {
      name: "Chocolate Croissant",
      images: ["https://via.placeholder.com/300/D2691E/FFFFFF?text=Croissant"],
      description: "Buttery croissant filled with chocolate",
      price: 180,
      discountRate: 0,
      calculatedPrice: 180,
      category: "Pastries",
      stock: 50,
      trackStock: true,
      storeId: stores[0]._id,
    },
    {
      name: "Iced Latte",
      images: ["https://via.placeholder.com/300/87CEEB/FFFFFF?text=IcedLatte"],
      description: "Chilled espresso with cold milk",
      price: 320,
      discountRate: 0,
      calculatedPrice: 320,
      category: "Cold Drinks",
      stock: null,
      trackStock: false,
      storeId: stores[0]._id,
    },
    // Fashion Hub products
    {
      name: "Denim Jacket",
      images: ["https://via.placeholder.com/300/4169E1/FFFFFF?text=Denim"],
      description: "Classic blue denim jacket",
      price: 3500,
      discountRate: 15,
      calculatedPrice: 2975,
      category: "Men",
      stock: 25,
      trackStock: true,
      storeId: stores[1]._id,
    },
    {
      name: "Summer Dress",
      images: ["https://via.placeholder.com/300/FF69B4/FFFFFF?text=Dress"],
      description: "Floral summer dress",
      price: 2800,
      discountRate: 20,
      calculatedPrice: 2240,
      category: "Women",
      stock: 30,
      trackStock: true,
      storeId: stores[1]._id,
    },
    {
      name: "Kids T-Shirt",
      images: ["https://via.placeholder.com/300/32CD32/FFFFFF?text=TShirt"],
      description: "Comfortable cotton t-shirt for kids",
      price: 800,
      discountRate: 0,
      calculatedPrice: 800,
      category: "Kids",
      stock: 100,
      trackStock: true,
      storeId: stores[1]._id,
    },
    {
      name: "Leather Belt",
      images: ["https://via.placeholder.com/300/8B4513/FFFFFF?text=Belt"],
      description: "Genuine leather belt",
      price: 1200,
      discountRate: 10,
      calculatedPrice: 1080,
      category: "Accessories",
      stock: 40,
      trackStock: true,
      storeId: stores[1]._id,
    },
  ]);
  console.log(`✅ Created ${products.length} products\n`);

  // ============================================
  // 7. CREATE REWARDS
  // ============================================
  console.log("🎁 Creating rewards...");
  const rewards = await Reward.insertMany([
    // Grinders Coffee rewards
    {
      store: stores[0]._id,
      name: "Free Americano",
      description: "Get a free Americano on your next visit",
      validity: "30",
      points: "100",
      evergreen: true,
      tier: "Bronze",
      type: "standard",
      redeemable: true,
      redeemableTimes: 1,
      template: {
        bgColor: "#8B4513",
        textColor: "#FFFFFF",
        buttonColor: "#D2691E",
      },
    },
    {
      store: stores[0]._id,
      name: "50% Off Any Drink",
      description: "Half price on any beverage",
      validity: "14",
      points: "200",
      evergreen: true,
      tier: "Silver",
      type: "standard",
      redeemable: true,
      redeemableTimes: 1,
    },
    {
      store: stores[0]._id,
      name: "Free Pastry",
      description: "Complimentary pastry of your choice",
      validity: "7",
      points: "150",
      evergreen: false,
      tier: "Bronze",
      type: "standard",
      redeemable: true,
      redeemableTimes: 2,
    },
    // Fashion Hub rewards
    {
      store: stores[1]._id,
      name: "Rs. 500 Off",
      description: "Flat Rs. 500 discount on purchase above Rs. 2000",
      validity: "60",
      points: "300",
      evergreen: true,
      tier: "Member",
      type: "standard",
      redeemable: true,
      redeemableTimes: 1,
    },
    {
      store: stores[1]._id,
      name: "Free Accessory",
      description: "Free accessory worth up to Rs. 1000",
      validity: "30",
      points: "500",
      evergreen: true,
      tier: "VIP",
      type: "standard",
      redeemable: true,
      redeemableTimes: 1,
    },
    // Spa Bliss rewards
    {
      store: stores[2]._id,
      name: "Free 30-min Massage",
      description: "Complimentary 30-minute relaxation massage",
      validity: "45",
      points: "100",
      evergreen: true,
      tier: "Regular",
      type: "standard",
      redeemable: true,
      redeemableTimes: 1,
    },
    {
      store: stores[2]._id,
      name: "20% Off Any Service",
      description: "20% discount on any spa service",
      validity: "30",
      points: "75",
      evergreen: true,
      tier: "Guest",
      type: "standard",
      redeemable: true,
      redeemableTimes: 3,
    },
  ]);
  console.log(`✅ Created ${rewards.length} rewards\n`);

  // ============================================
  // 8. CREATE POINTS CONFIG
  // ============================================
  console.log("⭐ Creating points configuration...");
  const pointsConfig = await Points.insertMany([
    { points: 1, store: stores[0]._id },
    { points: 1, store: stores[1]._id },
    { points: 1, store: stores[2]._id },
  ]);
  console.log(`✅ Created ${pointsConfig.length} points configurations\n`);

  // ============================================
  // 9. CREATE POINTS HISTORY
  // ============================================
  console.log("📊 Creating points history...");
  const pointsHistory = await PointsHistory.insertMany([
    {
      points: 10,
      billID: "BILL001",
      store: stores[0]._id,
      outlet: "Thamel Main Branch",
      customer: customers[0]._id,
      remarks: "Purchase - Coffee",
    },
    {
      points: 25,
      billID: "BILL002",
      store: stores[0]._id,
      outlet: "Thamel Main Branch",
      customer: customers[1]._id,
      remarks: "Purchase - Coffee + Pastry",
    },
    {
      points: 50,
      billID: "BILL003",
      store: stores[0]._id,
      outlet: "Durbar Marg Branch",
      customer: customers[2]._id,
      remarks: "Large order",
    },
    {
      points: 15,
      billID: "BILL004",
      store: stores[1]._id,
      customer: customers[4]._id,
      remarks: "T-shirt purchase",
    },
    {
      points: 35,
      billID: "BILL005",
      store: stores[1]._id,
      customer: customers[5]._id,
      remarks: "Dress purchase",
    },
    {
      points: 20,
      store: stores[2]._id,
      outlet: "Lazimpat Main",
      customer: customers[6]._id,
      remarks: "Facial service",
    },
  ]);
  console.log(`✅ Created ${pointsHistory.length} points history records\n`);

  // ============================================
  // 10. CREATE REDEMPTIONS
  // ============================================
  console.log("🎟️ Creating redemptions...");
  const redemptions = await Redemption.insertMany([
    {
      store: stores[0]._id,
      customer: customers[1]._id,
      reward: rewards[0]._id,
      status: "pending",
      redeemDate: new Date(),
    },
    {
      store: stores[0]._id,
      customer: customers[2]._id,
      reward: rewards[1]._id,
      status: "claimed",
      billID: "REDEEM001",
      redeemDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      store: stores[1]._id,
      customer: customers[5]._id,
      reward: rewards[3]._id,
      status: "pending",
      redeemDate: new Date(),
    },
  ]);
  console.log(`✅ Created ${redemptions.length} redemptions\n`);

  // ============================================
  // 11. CREATE ORDERS
  // ============================================
  console.log("🛒 Creating orders...");
  const orders = await Order.insertMany([
    {
      userName: "Ram Sharma",
      userPhone: "9801111111",
      userAddress: "Thamel, Kathmandu",
      storeId: stores[0]._id,
      products: [
        {
          productId: products[0]._id,
          productName: "Americano",
          productQuantity: 2,
          productPrice: 250,
          productTotalPrice: 500,
        },
        {
          productId: products[2]._id,
          productName: "Chocolate Croissant",
          productQuantity: 1,
          productPrice: 180,
          productTotalPrice: 180,
        },
      ],
      deliveryCharge: 100,
      totalAmount: 780,
      status: "delivered",
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userName: "Sita Thapa",
      userPhone: "9802222222",
      userAddress: "Lazimpat, Kathmandu",
      storeId: stores[0]._id,
      products: [
        {
          productId: products[1]._id,
          productName: "Cappuccino",
          productQuantity: 3,
          productPrice: 270,
          productTotalPrice: 810,
        },
      ],
      deliveryCharge: 100,
      totalAmount: 910,
      status: "processing",
      orderDate: new Date(),
    },
    {
      userName: "Binod KC",
      userPhone: "9805555555",
      userAddress: "New Road, Kathmandu",
      storeId: stores[1]._id,
      products: [
        {
          productId: products[4]._id,
          productName: "Denim Jacket",
          productQuantity: 1,
          productPrice: 2975,
          productTotalPrice: 2975,
        },
        {
          productId: products[7]._id,
          productName: "Leather Belt",
          productQuantity: 1,
          productPrice: 1080,
          productTotalPrice: 1080,
        },
      ],
      deliveryCharge: 150,
      totalAmount: 4205,
      status: "pending",
      orderDate: new Date(),
    },
  ]);
  console.log(`✅ Created ${orders.length} orders\n`);

  // ============================================
  // 12. CREATE OFFERS
  // ============================================
  console.log("🏷️ Creating offers...");
  const offers = await Offer.insertMany([
    {
      store: stores[0]._id,
      title: "Happy Hour Special",
      description: "50% off all drinks from 2 PM to 4 PM",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      display: true,
      targetAudience: "all",
    },
    {
      store: stores[0]._id,
      title: "Weekend Brunch Deal",
      description: "Buy 2 coffees, get 1 pastry free",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      display: true,
      targetAudience: "loyaltyMembers",
    },
    {
      store: stores[1]._id,
      title: "Season Sale",
      description: "Up to 40% off on selected items",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
      display: true,
      targetAudience: "all",
    },
    {
      store: stores[2]._id,
      title: "Couples Spa Package",
      description: "Special couples massage at 30% off",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
      display: true,
      targetAudience: "all",
    },
  ]);
  console.log(`✅ Created ${offers.length} offers\n`);

  // ============================================
  // 13. CREATE RESERVATION SETTINGS
  // ============================================
  console.log("⚙️ Creating reservation settings...");
  const reservationSettings = await ReservationSetting.insertMany([
    {
      store: stores[0]._id,
      services: [
        {
          name: "Table Reservation",
          description: "Reserve a table at our cafe",
          price: "Free",
          autoConfirmation: true,
          needTimeSlots: true,
          timeSlots: [
            { outlet: "Thamel Main Branch", time: "10:00 AM", numberOfSlots: 5 },
            { outlet: "Thamel Main Branch", time: "12:00 PM", numberOfSlots: 8 },
            { outlet: "Thamel Main Branch", time: "02:00 PM", numberOfSlots: 6 },
            { outlet: "Durbar Marg Branch", time: "11:00 AM", numberOfSlots: 4 },
          ],
        },
      ],
      autoConfirmation: true,
      needTimeSlots: true,
    },
    {
      store: stores[2]._id,
      services: [
        {
          name: "Swedish Massage",
          description: "60-minute full body relaxation massage",
          price: "Rs. 2500",
          autoConfirmation: false,
          needTimeSlots: true,
          timeSlots: [
            { outlet: "Lazimpat Main", time: "10:00 AM", numberOfSlots: 2 },
            { outlet: "Lazimpat Main", time: "02:00 PM", numberOfSlots: 2 },
            { outlet: "Boudha Branch", time: "11:00 AM", numberOfSlots: 2 },
          ],
        },
        {
          name: "Facial Treatment",
          description: "45-minute rejuvenating facial",
          price: "Rs. 1800",
          autoConfirmation: true,
          needTimeSlots: true,
          timeSlots: [
            { outlet: "Lazimpat Main", time: "09:00 AM", numberOfSlots: 3 },
            { outlet: "Lazimpat Main", time: "01:00 PM", numberOfSlots: 3 },
          ],
        },
        {
          name: "Manicure & Pedicure",
          description: "Complete nail care package",
          price: "Rs. 1200",
          autoConfirmation: true,
          needTimeSlots: false,
        },
      ],
      autoConfirmation: false,
      needTimeSlots: true,
    },
  ]);
  console.log(`✅ Created ${reservationSettings.length} reservation settings\n`);

  // ============================================
  // 14. CREATE RESERVATIONS
  // ============================================
  console.log("📅 Creating reservations...");
  const reservations = await Reservation.insertMany([
    {
      customer: customers[0]._id,
      store: stores[0]._id,
      services: ["Table Reservation"],
      numberofGuests: "4",
      outlet: "Thamel Main Branch",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: "12:00 PM",
      note: "Birthday celebration",
      status: "confirmed",
    },
    {
      customer: customers[1]._id,
      store: stores[0]._id,
      services: ["Table Reservation"],
      numberofGuests: "2",
      outlet: "Durbar Marg Branch",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: "11:00 AM",
      status: "pending",
    },
    {
      customer: customers[6]._id,
      store: stores[2]._id,
      services: ["Swedish Massage"],
      outlet: "Lazimpat Main",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: "02:00 PM",
      note: "First time visitor",
      status: "confirmed",
    },
    {
      customer: customers[7]._id,
      store: stores[2]._id,
      services: ["Facial Treatment", "Manicure & Pedicure"],
      outlet: "Lazimpat Main",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: "09:00 AM",
      status: "pending",
    },
  ]);
  console.log(`✅ Created ${reservations.length} reservations\n`);

  // ============================================
  // 15. CREATE WHEEL SEGMENTS
  // ============================================
  console.log("🎡 Creating wheel segments...");
  const wheelSegments = await WheelSegment.insertMany([
    // Grinders Coffee wheel
    {
      store: stores[0]._id,
      label: "10 Points",
      color: "#FF6B6B",
      value: 10,
      type: "points",
      isActive: true,
    },
    {
      store: stores[0]._id,
      label: "25 Points",
      color: "#4ECDC4",
      value: 25,
      type: "points",
      isActive: true,
    },
    {
      store: stores[0]._id,
      label: "Free Coffee",
      reward: rewards[0]._id,
      color: "#45B7D1",
      value: 1,
      type: "rewards",
      isActive: true,
    },
    {
      store: stores[0]._id,
      label: "Try Again",
      color: "#96CEB4",
      value: 0,
      type: "neutral",
      isActive: true,
    },
    {
      store: stores[0]._id,
      label: "50 Points",
      color: "#FFEAA7",
      value: 50,
      type: "points",
      isActive: true,
    },
    {
      store: stores[0]._id,
      label: "Better Luck",
      color: "#DDA0DD",
      value: 0,
      type: "neutral",
      isActive: true,
    },
  ]);
  console.log(`✅ Created ${wheelSegments.length} wheel segments\n`);

  // ============================================
  // 16. CREATE NOTIFICATIONS
  // ============================================
  console.log("🔔 Creating notifications...");
  const notifications = await Notification.insertMany([
    {
      store: stores[0]._id,
      title: "Welcome to Grinders Coffee!",
      message:
        "Thank you for joining our loyalty program. Start earning points today!",
      receivers: [
        { customer: customers[0]._id, read: true, readAt: new Date() },
        { customer: customers[1]._id, read: false },
        { customer: customers[2]._id, read: true, readAt: new Date() },
        { customer: customers[3]._id, read: false },
      ],
    },
    {
      store: stores[0]._id,
      title: "New Offer Available!",
      message: "Check out our Happy Hour Special - 50% off all drinks!",
      receivers: [
        { customer: customers[0]._id, read: false },
        { customer: customers[1]._id, read: false },
      ],
    },
    {
      store: stores[1]._id,
      title: "Season Sale is Live!",
      message: "Up to 40% off on selected items. Shop now!",
      receivers: [
        { customer: customers[4]._id, read: false },
        { customer: customers[5]._id, read: true, readAt: new Date() },
      ],
    },
  ]);
  console.log(`✅ Created ${notifications.length} notifications\n`);

  // ============================================
  // 17. CREATE MAIL/SMS SETTINGS
  // ============================================
  console.log("📧 Creating mail/SMS settings...");
  const mailSMSSettings = await MailSMS.insertMany([
    { store: stores[0]._id },
    { store: stores[1]._id },
    { store: stores[2]._id },
  ]);
  console.log(`✅ Created ${mailSMSSettings.length} mail/SMS settings\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("═".repeat(50));
  console.log("🎉 DATABASE SEEDING COMPLETE!");
  console.log("═".repeat(50));
  console.log("\n📊 Summary:");
  console.log(`   • Users: ${users.length}`);
  console.log(`   • Stores: ${stores.length}`);
  console.log(`   • Outlets: ${outlets.length}`);
  console.log(`   • Customers: ${customers.length}`);
  console.log(`   • Categories: ${categories.length}`);
  console.log(`   • Products: ${products.length}`);
  console.log(`   • Rewards: ${rewards.length}`);
  console.log(`   • Points History: ${pointsHistory.length}`);
  console.log(`   • Redemptions: ${redemptions.length}`);
  console.log(`   • Orders: ${orders.length}`);
  console.log(`   • Offers: ${offers.length}`);
  console.log(`   • Reservations: ${reservations.length}`);
  console.log(`   • Wheel Segments: ${wheelSegments.length}`);
  console.log(`   • Notifications: ${notifications.length}`);
  console.log("\n🔐 Test Credentials:");
  console.log("   Admin: admin@samparka.co / password123");
  console.log("   Store 1: store1@test.com / password123");
  console.log("   Store 2: store2@test.com / password123");
  console.log("\n🏪 Store URLs:");
  console.log("   • grinders-coffee");
  console.log("   • fashion-hub");
  console.log("   • spa-bliss");
  console.log("═".repeat(50));
};

// ============================================
// MAIN EXECUTION
// ============================================
async function runSeed() {
  try {
    const dbConfig = getDatabaseConfig();

    // Safety check - don't seed production!
    if (dbConfig.env === "production") {
      console.error("❌ ERROR: Cannot seed production database!");
      console.error("   Set NODE_ENV=development to run seed script.");
      process.exit(1);
    }

    console.log(`🔄 Connecting to ${dbConfig.name} Database...`);
    await mongoose.connect(dbConfig.uri);
    console.log(`✅ Connected to ${dbConfig.name} Database\n`);

    await createDummyData();

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

runSeed();
