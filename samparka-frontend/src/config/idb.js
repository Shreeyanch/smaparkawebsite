import { openDB } from "idb";

// Function to initialize the database
async function initializeDB() {
  return await openDB("myAppDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("auth")) {
        db.createObjectStore("auth", { keyPath: "key" });
      }
    },
  });
}

// Save user data
export async function saveUserInfo(userInfo, token) {
  const db = await initializeDB();
  await db.put("auth", { key: "userInfo", value: userInfo });
  await db.put("auth", { key: "token", value: token });
}

// Retrieve user data
export async function getUserInfo() {
  const db = await initializeDB();
  const userInfo = await db.get("auth", "userInfo");
  const token = await db.get("auth", "token");
  return { userInfo: userInfo?.value, token: token?.value };
}
