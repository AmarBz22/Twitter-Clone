import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useAuth } from "../../context/AuthContext";

const Posts = ({ loading }) => {
  const { authUser } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:8000/api/post/all", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <>
      {posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {posts.map((post) => (
        <Post key={post._id} post={post} onDelete={handleDelete} />
      ))}
    </>
  );
};

export default Posts;
