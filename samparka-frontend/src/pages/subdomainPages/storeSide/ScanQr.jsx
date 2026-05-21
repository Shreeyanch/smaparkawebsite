import React, { useState, useMemo, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import api from "../../../api/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SwitchCamera } from "lucide-react";

export default function ScanQr({ store }) {
  const token = localStorage.getItem("storeToken");
  const navigate = useNavigate();
  const [qrData, setQRData] = useState(null);
  const [qrPoints, setQRPoints] = useState("");
  const [billAmount, setBillAmount] = useState();
  const [billID, setBillID] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState("rear"); // Default to back camera

  useEffect(() => {
    if (!token) {
      navigate("/store/login");
    }
  }, [token]);

  const toggleCamera = () => {
    setCameraFacingMode((prev) => (prev === "rear" ? "front" : "rear"));
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data.text);
        setQRData(parsedData);
      } catch (error) {
        console.error("Invalid QR Code format", error);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const conversionRate = Number(store?.conversionRate);
  const isAmountMode = conversionRate > 0 && !isNaN(conversionRate);

  const previewPoints = isAmountMode && billAmount
    ? (store.isRounded
        ? Math.round(Number(billAmount) / conversionRate)
        : Math.round((Number(billAmount) / conversionRate) * 10) / 10)
    : null;

  const handleAwardPoints = async (e) => {
    e.preventDefault();
    if (!qrData) {
      alert("Please Scan a QR Code");
      return;
    }
    if (isAmountMode && !billAmount) {
      alert("Please enter the bill amount");
      return;
    }
    if (!isAmountMode && !qrPoints) {
      alert("Please enter points to award");
      return;
    }

    try {
      let points;

      if (isAmountMode) {
        if (store.isRounded) {
          points = Math.round(Number(billAmount) / conversionRate);
        } else {
          points = Math.round((Number(billAmount) / conversionRate) * 10) / 10;
        }
        if (!points || points <= 0) {
          toast.error("Calculated points is 0. Check the bill amount.");
          return;
        }
      } else {
        points = qrPoints;
      }

      const outletId = localStorage.getItem("outletId");
      const response = await api.post(
        `/store/awardPointsS/${qrData.id}`,
        {
          points,
          billID,
          storeId: store._id,
          ...(outletId && { outlet: outletId }),
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }

      setQRData(null);
      setQRPoints("");
      setBillID("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error awarding points", error);
    }
  };

  const qrScanner = useMemo(
    () => (
      <div className="flex flex-col justify-center items-center relative">
        {/* Simplified Scanner Frame */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Clean border frame */}
          <div className="absolute w-64 h-64 border-2 border-gray-300 rounded-lg"></div>

          {/* Scanner */}
          <div className="relative w-60 h-60 bg-black rounded-lg overflow-hidden shadow-sm">
            <QrScanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                video: {
                  facingMode:
                    cameraFacingMode === "rear"
                      ? { exact: "environment" }
                      : "user",
                },
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={toggleCamera}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <SwitchCamera size={18} />
            Switch Camera
          </button>
        </div>
      </div>
    ),
    [cameraFacingMode]
  );

  return (
    <div className="">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-gray-800 text-2xl font-medium mb-8">
            Scan QR Code
          </h2>

          {qrData ? (
            <div className="mt-8 text-center">
              <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Name:</span> {qrData.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {qrData.phone}
                </p>
              </div>

              <form
                onSubmit={handleAwardPoints}
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm w-full max-w-md mx-auto"
              >
                {isAmountMode ? (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Bill Amount
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="Enter amount"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full p-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                      value={billAmount}
                    />
                    {previewPoints !== null && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        Points to award: <span className="font-bold">{previewPoints}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Points to Award
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Enter points"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setQRPoints(e.target.value)}
                      className="w-full p-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                      value={qrPoints}
                    />
                  </div>
                )}

                {store?.needBillID && (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Bill ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bill ID"
                      value={billID}
                      required
                      className="w-full p-3 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                      onChange={(e) => setBillID(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQRData(null);
                      setQRPoints("");
                      setBillID("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-gray-700 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white font-medium rounded-lg"
                  >
                    Award Points
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-center">{qrScanner}</div>
          )}
        </div>
      </div>
    </div>
  );
}
