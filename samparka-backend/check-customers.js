const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.NODE_ENV === 'development'
  ? process.env.MONGODB_DEV_URI
  : process.env.MONGODBCONNECTIONSTRING;

mongoose.connect(connectionString).then(async () => {
  console.log('Connected to MongoDB');

  // Load models
  const Customer = require('./src/models/customerModel');
  const Store = require('./src/models/storeModel');

  const customer1 = await Customer.findById('69804e8bfc00659608f483c1')
    .select('name email phone countryCode store')
    .populate('store', 'name');

  const customer2 = await Customer.findById('69804e8bfc00659608f483a9')
    .select('name email phone countryCode store')
    .populate('store', 'name');

  console.log('\n========== Customer 1 (being awarded points) ==========');
  console.log('ID:', customer1._id);
  console.log('Name:', customer1.name);
  console.log('Email:', customer1.email);
  console.log('Phone:', customer1.countryCode + customer1.phone);
  console.log('Store:', customer1.store?.name);

  console.log('\n========== Customer 2 (viewing loyalty card) ==========');
  console.log('ID:', customer2._id);
  console.log('Name:', customer2.name);
  console.log('Email:', customer2.email);
  console.log('Phone:', customer2.countryCode + customer2.phone);
  console.log('Store:', customer2.store?.name);

  console.log('\n========== Analysis ==========');
  if (customer1.phone === customer2.phone && customer1.countryCode === customer2.countryCode) {
    console.log('⚠️  DUPLICATE DETECTED: Same phone number!');
  }
  if (customer1.email === customer2.email) {
    console.log('⚠️  DUPLICATE DETECTED: Same email!');
  }

  await mongoose.connection.close();
  console.log('\nConnection closed');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
