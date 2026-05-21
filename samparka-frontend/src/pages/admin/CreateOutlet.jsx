import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { StoreIcon, X, MapPin, Phone, ExternalLink } from "lucide-react";
import api from "../../api/config";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const CreateOutlet = ({ store, onClose, onSuccess }) => {
  // Safety check
  if (!store) {
    return null;
  }
  
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleMapLinkChange = async (e) => {
    const value = e.target.value;
    setMapLink(value);
    setCoords(null);
    if (!value.trim()) return;
    setCoordsLoading(true);
    try {
      const res = await api.get(`/store/resolveMapLink?url=${encodeURIComponent(value)}`, {
        headers: { token },
      });
      if (res.data.success) {
        setCoords({ lat: res.data.lat, lng: res.data.lng });
      }
    } catch {
      // silent — coords just won't be saved
    } finally {
      setCoordsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post(
        `/store/createOutlet/${store._id}`,
        {
          location,
          phone,
          mapLink: mapLink || undefined,
          ...(coords && { lat: coords.lat, lng: coords.lng }),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        if (onSuccess) {
          setIsVisible(false);
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      {isLoading && <LoadingSpinner />}
      
      <div 
        className={`rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } ${isVisible ? 'translate-x-0' : 'translate-x-full'
        }`} 
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header - Fixed */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 items-center text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <StoreIcon className="w-6 h-6" />
            Create Outlet - {store.name}
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="space-y-6">
            {/* Header Info */}
            <div className={`border rounded-lg p-4 ${
              isDarkMode 
                ? 'bg-green-900/20 border-green-700' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className={`flex items-center gap-2 ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                <StoreIcon className="w-5 h-5" />
                <span className="font-medium">Create New Outlet</span>
              </div>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-green-200' : 'text-green-600'
              }`}>
                Add a new outlet location for {store.name}. This will create a separate location under the same store.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MapPin className="h-5" />
                  Outlet Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter outlet location"
                />
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Provide a clear, specific address or location name for the new outlet.
                </p>
              </div>

              <div>
                <label className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Phone className="h-5" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter phone number"
                />
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Contact phone number for this outlet.
                </p>
              </div>

              <div>
                <label className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <ExternalLink className="h-5" />
                  Map Link (Optional)
                </label>
                <input
                  type="url"
                  id="mapLink"
                  name="mapLink"
                  value={mapLink}
                  onChange={handleMapLinkChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                />
                {coordsLoading && (
                  <p className="text-xs mt-1 text-blue-500">Resolving coordinates...</p>
                )}
                {coords && !coordsLoading && (
                  <p className="text-xs mt-1 text-green-600">
                    ✓ Coordinates found: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
                {mapLink && !coords && !coordsLoading && (
                  <p className="text-xs mt-1 text-amber-500">
                    ⚠ Could not extract coordinates — outlet won't appear on map
                  </p>
                )}
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Paste any Google Maps link (including short links like maps.app.goo.gl).
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t rounded-b-lg ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            onClick={handleClose}
            className={`px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors ${
              isDarkMode 
                ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white' 
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!location.trim() || !phone.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Create Outlet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOutlet;
