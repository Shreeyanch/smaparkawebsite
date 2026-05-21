import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_BASE_URL}api/wheel`,
});

export const getSegments = (storeID) => API.get(`/${storeID}`);
export const spinWheel = () => API.post("/spin");
export const giveRewardToUser = (userId, pendingReward) =>
  API.post("/getReward", { userId, pendingReward });
export const createSegment = (data) => API.post("/", data);
export const updateSegment = (id, data) => API.put(`/${id}`, data);
export const deleteSegment = (id) => API.delete(`/${id}`);
