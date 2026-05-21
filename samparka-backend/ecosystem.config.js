module.exports = {
  apps: [
    {
      name: "samparka-backend",
      script: "src/index.js",
      cwd: "/home/deploy/apps/samparka/samparka-backend",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Kathmandu",
      },
    },
  ],
};
