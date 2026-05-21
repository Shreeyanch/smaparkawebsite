import api from "./config";

const fetchStoreData = async (subdomain) => {
  if (!subdomain || subdomain === "" || subdomain === "www") {
    throw new Error("Invalid subdomain");
  }

  try {
    // // Fetch manifest.json
    // const manifestRes = await fetch(
    //   `${
    //     import.meta.env.VITE_SERVER_BASE_URL
    //   }manifest.json?subdomain=${subdomain}`
    // );
    // const store = await manifestRes.json();

    // Fetch store details from API
    const response = await api.get(`/store/checkStore/${subdomain}`);

    return {
      // manifest: store,
      storeData: response.data.store,
      success: response.data.success,
    };
  } catch (error) {
    throw new Error("Failed to fetch store data");
  }
};
export default fetchStoreData;
