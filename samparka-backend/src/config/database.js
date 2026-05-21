/**
 * Database Configuration
 * Automatically selects the correct database based on NODE_ENV
 */

const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || "development";

  const configs = {
    development: {
      uri: process.env.MONGODB_DEV_URI,
      name: "Development",
    },
    production: {
      uri: process.env.MONGODBCONNECTIONSTRING,
      name: "Production",
    },
    test: {
      uri: process.env.MONGODB_TEST_URI,
      name: "Test",
    },
  };

  const config = configs[env] || configs.development;

  if (!config.uri) {
    throw new Error(
      `❌ No database URI configured for environment: ${env}. Please set ${env === "development" ? "MONGODB_DEV_URI" : env === "test" ? "MONGODB_TEST_URI" : "MONGODBCONNECTIONSTRING"} in your .env file.`
    );
  }

  return {
    ...config,
    env,
  };
};

module.exports = { getDatabaseConfig };
