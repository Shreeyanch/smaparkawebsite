import React, { useState } from "react";
import { toast } from "sonner";
import config from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const AfterCreateCustomer = (state) => {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState(state.notifications.title);
  const [body, setBody] = useState(state.notifications.body);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await config.put(
        `/store/configNotifications/${state.store._id}`,
        { title, body, status: state.status },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };

  return (
    <form className="mx-20" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="relative">
        <label
          htmlFor="from"
          className={`block text-md font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Title:
        </label>
        <div className="relative">
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (!/^[a-zA-Z0-9]$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
              }
            }}
            className={`my-2 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 pr-10 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>
      <label
        htmlFor="textEditor"
        className={`block text-md font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        Body:
      </label>
      <div className="my-2">
        <textarea
          className={`my-2 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 pr-10 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          rows={10}
          cols={75}
          name="body"
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
      >
        Submit
      </button>
    </form>
  );
};

export default AfterCreateCustomer;
