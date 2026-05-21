import { useState, useEffect, useRef } from "react";
import { MapPin, Locate, Info, Navigation, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import api from "../../api/config";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Green crosshair marker for user location
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:40px;height:40px;border-radius:50%;
    background:#1a3a2a;border:3px solid #2d6a4f;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 10px rgba(0,0,0,0.3);
  ">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Red circle marker with store logo for outlets
function createOutletIcon(logoUrl) {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="width:24px;height:24px;object-fit:contain;border-radius:4px;" />`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#dc2626"/></svg>`;

  return L.divIcon({
    className: "",
    html: `<div style="
      width:48px;height:48px;border-radius:50%;
      background:#dc2626;
      border:4px solid rgba(255,255,255,0.9);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 12px rgba(220,38,38,0.4);
    ">${logoHtml}</div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

// Component to recenter map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
};

// Haversine distance in km between two [lat, lng] points
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Parse coordinates from a Google Maps URL
function extractCoordsFromUrl(url) {
  if (!url) return null;
  try {
    // Match patterns like @27.7,85.3 or /place/27.7,85.3 or q=27.7,85.3
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

const OutletCard = ({ outlet, storeName, storeLogo, cardColor, distance, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-left transition-shadow hover:shadow-md"
  >
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: `${cardColor}15` }}
    >
      {storeLogo ? (
        <img
          src={storeLogo}
          alt={storeName}
          className="w-10 h-10 object-contain rounded-lg"
        />
      ) : (
        <MapPin size={24} style={{ color: cardColor }} />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {storeName}
      </p>
      <p className="text-xs text-gray-500 truncate">{outlet.location}</p>
      {outlet.phone && (
        <p className="text-xs text-gray-400 mt-0.5">{outlet.phone}</p>
      )}
    </div>

    <div className="flex flex-col items-end gap-1 shrink-0">
      {distance != null && (
        <span className="text-xs font-medium text-gray-500">{formatDistance(distance)}</span>
      )}
      {outlet.mapLink && (
        <Info size={16} className="text-gray-300" />
      )}
    </div>
  </button>
);

const OutletMap = () => {
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const { authState } = useStoreAuth();
  const { token } = authState;
  const navigate = useNavigate();

  const cardColor = storeData?.loyaltyCard?.cardColor || "#275b46";
  const storeName = storeData?.name || "Store";
  const storeLogo = storeData?.frontLogo || storeData?.logo;
  const outlets = storeData?.outlets || [];

  const [userPos, setUserPos] = useState(null);
  const [recenter, setRecenter] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  // resolvedCoords: { [outletId]: [lat, lng] }
  const [resolvedCoords, setResolvedCoords] = useState({});

  // On mount: resolve coordinates for outlets that have a mapLink but no stored lat/lng
  useEffect(() => {
    const needsResolving = outlets.filter(
      (o) => o.mapLink && (o.lat == null || o.lng == null) && !extractCoordsFromUrl(o.mapLink)
    );
    if (needsResolving.length === 0) return;

    needsResolving.forEach(async (outlet) => {
      try {
        const res = await api.get(
          `/store/resolveMapLink?url=${encodeURIComponent(outlet.mapLink)}`,
          { headers: { token } }
        );
        if (res.data.success) {
          setResolvedCoords((prev) => ({
            ...prev,
            [outlet._id]: [res.data.lat, res.data.lng],
          }));
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const getOutletCoords = (outlet) => {
    if (outlet.lat != null && outlet.lng != null) return [outlet.lat, outlet.lng];
    const fromUrl = extractCoordsFromUrl(outlet.mapLink);
    if (fromUrl) return fromUrl;
    return resolvedCoords[outlet._id] || null;
  };

  const outletsWithCoords = outlets
    .map((o) => ({ ...o, coords: getOutletCoords(o) }))
    .filter((o) => o.coords);

  // Default center: first outlet with coords, or Kathmandu fallback
  const defaultCenter =
    outletsWithCoords.length > 0
      ? outletsWithCoords[0].coords
      : [27.7172, 85.324];

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleLocate = () => {
    if (userPos) {
      setRecenter([...userPos]);
    } else {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          setRecenter(coords);
        },
        () => {}
      );
    }
  };

  const handleOutletClick = (outlet) => {
    if (outlet.coords) {
      setRecenter([...outlet.coords]);
      setSelectedOutlet(outlet._id);
    } else if (outlet.mapLink) {
      window.open(outlet.mapLink, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Map Section */}
      <div className="w-full h-[55vh] relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {recenter && <RecenterMap center={recenter} />}

          {/* User location marker */}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Outlet markers */}
          {outletsWithCoords.map((outlet) => (
            <Marker
              key={outlet._id}
              position={outlet.coords}
              icon={createOutletIcon(storeLogo)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{storeName}</p>
                  <p className="text-gray-500">{outlet.location}</p>
                  {outlet.mapLink && (
                    <a
                      href={outlet.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-[1000] w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        {/* Locate me button */}
        <button
          onClick={handleLocate}
          className="absolute bottom-6 right-4 z-[1000] w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center"
        >
          <Locate size={20} style={{ color: cardColor }} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <div className="relative -mt-6 z-10 bg-white rounded-t-3xl flex-1 pb-32">
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Nearby outlet</h2>
          {outlets.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {outlets.length} location{outlets.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="px-4 space-y-3 pb-4">
          {outlets.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MapPin size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No outlets available</p>
            </div>
          )}

          {[...outlets]
            .map((outlet) => {
              const coords = getOutletCoords(outlet);
              const distance =
                userPos && coords ? haversineDistance(userPos, coords) : null;
              return { ...outlet, coords, distance };
            })
            .sort((a, b) => {
              if (a.distance == null && b.distance == null) return 0;
              if (a.distance == null) return 1;
              if (b.distance == null) return -1;
              return a.distance - b.distance;
            })
            .map((outlet) => (
              <OutletCard
                key={outlet._id}
                outlet={outlet}
                storeName={storeName}
                storeLogo={storeLogo}
                cardColor={cardColor}
                distance={outlet.distance}
                onClick={() => handleOutletClick(outlet)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OutletMap;
