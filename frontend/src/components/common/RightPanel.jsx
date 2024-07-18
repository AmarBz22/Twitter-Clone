import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";

const RightPanel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:8000/api/user/suggested", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setSuggestedUsers(response.data || []); 
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }

      const url = `http://localhost:8000/api/user/follow/${userId}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await axios({
        method: method,
        url: url,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuggestedUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user._id === userId) {
            if (isFollowing) {
              return {
                ...user,
                followers: user.followers?.filter(followerId => followerId !== response.data.currentUser._id) || []
              };
            } else {
              return {
                ...user,
                followers: [...(user.followers || []), response.data.currentUser._id]
              };
            }
          }
          return user;
        });
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <div className='hidden lg:block my-4 mx-2'>
      <div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
        <p className='font-bold'>Who to follow</p>
        <div className='flex flex-col gap-4'>
          {isLoading ? (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          ) : (
            suggestedUsers.length === 0 ? (
              <p>No suggested users found.</p>
            ) : (
              suggestedUsers.map((user) => (
                <div className='flex items-center justify-between gap-4' key={user._id}>
                  <Link to={`/profile/${user.username}`} className='flex gap-2 items-center'>
                    <div className='avatar'>
                      <div className='w-8 rounded-full'>
                        <img src={user.profileImg || "/avatar-placeholder.png"} alt="User Avatar" />
                      </div>
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-semibold tracking-tight truncate w-28'>
                        {user.fullName}
                      </span>
                      <span className='text-sm text-slate-500'>@{user.username}</span>
                    </div>
                  </Link>
                  <div>
                    <button
                      className={`btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm ${user.followers?.includes(user._id) ? 'text-gray-500' : 'text-blue-500'}`}
                      onClick={() => handleFollowToggle(user._id, user.followers?.includes(user._id))}
                    >
                      {user.followers?.includes(user._id) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
