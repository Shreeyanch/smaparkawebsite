import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../../api/config";
import LoadingSpinner from "../../components/LoadingSpinner";
import InstallationGuide from "../../components/InstallationGuide";
import LoyalityCardComponent from "../../components/LoyalityCardComponent";
import { toast } from "sonner";

const LoyalityCard = (store) => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    const getCustomerData = async () => {
      try {
        const response = await api.get("/customer", { headers: { token } });
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const getStore = async () => {
      try {
        const response = await api.get(`/customer/loyaltyCard/${store.url}`, {
          headers: { token },
        });
        if (response.data.success) {
          setCardData({
            ...response.data.store.loyaltyCard,
            store: response.data.store.name,
            logo: response.data.store.logo,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getStore();
    getCustomerData();
  }, [token]);

  if (!user || !token) {
    return null;
  }

  return (
    <div>
      {loading && <LoadingSpinner />}
      <div className="">
        <LoyalityCardComponent {...cardData} points={user?.points || 0} />
      </div>
      <div className="relative">
        {/* Install Banner */}
        <InstallationGuide />
      </div>
      <Outlet />
    </div>
  );
};

export default LoyalityCard;
