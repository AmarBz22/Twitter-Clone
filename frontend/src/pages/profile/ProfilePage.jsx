import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeletons";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams(); // Get the userId from the URL params

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:8000/api/user/profile/${username}`, config);
      console.log("Profile response:", data); // Debug log to check fetched data

      if (data && data._id) { // Check if data contains user information
        setUser(data); // Set the entire user object received from the server
        setIsLoading(false); // Set loading state to false
      } else {
        setIsLoading(false);
        console.error("User data not found in response:", data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsLoading(false);
      // Handle specific errors here if needed
    }
  };

  const fetchAllPosts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/posts");
      setPosts(data);
    } catch (error) {
      console.error("Error fetching all posts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserProfile();
      await fetchAllPosts();
      // Additional fetch functions can be added here if needed
    };
    fetchData();
  }, [username]);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isMyProfile = user && user._id === localStorage.getItem('userId'); // Check if the profile belongs to the logged-in user

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      const formData = new FormData();
      if (profileImg) {
        formData.append("profileImg", profileImg);
      }
      if (coverImg) {
        formData.append("coverImg", coverImg);
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.put("http://localhost:8000/api/user/update", formData, config);
      setUser(data);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  console.log("User state:", user);

  return (
    <>
      <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
        {/* HEADER */}
        {isLoading && <ProfileHeaderSkeleton />}
        {!isLoading && !user && <p className='text-center text-lg mt-4'>User not found</p>}
        <div className='flex flex-col'>
          {!isLoading && user && (
            <>
              <div className='flex gap-10 px-4 py-2 items-center'>
                <Link to='/'>
                  <FaArrowLeft className='w-4 h-4' />
                </Link>
                <div className='flex flex-col'>
                  <p className='font-bold text-lg'>{user?.fullName}</p>
                  <span className='text-sm text-slate-500'>{posts.length} posts</span>
                </div>
              </div>
              {/* COVER IMG */}
              <div className='relative group/cover'>
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className='h-52 w-full object-cover'
                  alt='cover image'
                />
                {isMyProfile && (
                  <div
                    className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className='w-5 h-5 text-white' />
                  </div>
                )}

                <input
                  type='file'
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type='file'
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className='avatar absolute -bottom-16 left-4'>
                  <div className='w-32 rounded-full relative group/avatar'>
                    <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} />
                    <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                      {isMyProfile && (
                        <MdEdit
                          className='w-4 h-4 text-white'
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex justify-end px-4 mt-5'>
                {isMyProfile && <EditProfileModal />}
                {!isMyProfile && (
                  <button
                    className='btn btn-outline rounded-full btn-sm'
                    onClick={() => alert("Followed successfully")}
                  >
                    Follow
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <button
                    className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                    onClick={handleProfileUpdate}
                  >
                    Update
                  </button>
                )}
              </div>

              <div className='flex flex-col gap-4 mt-14 px-4'>
                <div className='flex flex-col'>
                  <span className='font-bold text-lg'>{user?.fullName}</span>
                  <span className='text-sm text-slate-500'>@{user?.username}</span>
                  <span className='text-sm my-1'>{user?.bio}</span>
                </div>

                <div className='flex gap-2 flex-wrap'>
                  {user?.link && (
                    <div className='flex gap-1 items-center '>
                      <>
                        <FaLink className='w-3 h-3 text-slate-500' />
                        <a
                          href={user?.link}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm text-blue-500 hover:underline'
                        >
                          {user?.link}
                        </a>
                      </>
                    </div>
                  )}
                  <div className='flex gap-2 items-center'>
                    <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                    <span className='text-sm text-slate-500'>Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.following.length}</span>
                    <span className='text-slate-500 text-xs'>Following</span>
                  </div>
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.followers.length}</span>
                    <span className='text-slate-500 text-xs'>Followers</span>
                  </div>
                </div>
              </div>
              <div className='flex w-full border-b border-gray-700 mt-4'>
                <div
                  className='flex justify-center flex-1 p-2 hover:bg-gray-900 cursor-pointer'
                  onClick={() => setFeedType("posts")}
                >
                  <span
                    className={`${
                      feedType === "posts" && "font-bold border-b-4 border-blue-500"
                    } text-sm`}
                  >
                    Posts
                  </span>
                </div>
                <div
                  className='flex justify-center flex-1 p-2 hover:bg-gray-900 cursor-pointer'
                  onClick={() => setFeedType("replies")}
                >
                  <span
                    className={`${
                      feedType === "replies" && "font-bold border-b-4 border-blue-500"
                    } text-sm`}
                  >
                    Replies
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {feedType === "posts" && <Posts posts={posts} />}
        {feedType === "replies" && <p className='text-center p-4'>No replies yet</p>}
      </div>
    </>
  );
};

export default ProfilePage;
