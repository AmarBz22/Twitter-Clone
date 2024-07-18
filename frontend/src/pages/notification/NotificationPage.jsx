import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import axios from "axios"; // Import Axios for making HTTP requests

const NotificationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
		try {
		  const token = localStorage.getItem('token');
		  if (!token) {
			throw new Error("No token found");
		  }
	  
		  const config = {
			headers: {
			  'Authorization': `Bearer ${token}`,
			}
		  };
	  
		  const response = await axios.get("http://localhost:8000/api/notifications", config);
		  setNotifications(response.data);
		  setIsLoading(false);
		} catch (error) {
		  console.error("Error fetching notifications:", error);
		  setIsLoading(false);
		  // Handle specific error cases, e.g., token expiration, unauthorized access
		}
	  };

    fetchNotifications();
  }, []); // Run once on component mount

  const deleteNotifications = () => {
    alert("All notifications deleted");
    // Implement delete functionality here if needed on the frontend
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        ) : (
          notifications.map((notification) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-primary" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                <Link to={`/profile/${notification.from.username}`}>
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="font-bold">
                      @{notification.from.username}
                    </span>{" "}
                    {notification.type === "follow"
                      ? "followed you"
                      : "liked your post"}
                  </div>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default NotificationPage;
