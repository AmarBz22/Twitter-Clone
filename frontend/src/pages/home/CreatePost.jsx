import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import axios from "axios";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";

const CreatePost = () => {
  const { authUser } = useAuth(); 
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const imgRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (img) {
        formData.append("img", img); 
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post("http://localhost:8000/api/post/create", formData, config);

      setIsPending(false);
      setText("");
      setImg(null);
      toast.success("Post created successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000); 
    } catch (error) {
      console.error("Error creating post:", error);
      setIsError(true);
      toast.error("Failed to create post");
    } finally {
      setIsPending(false);
    }
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={authUser.profileImg || "/avatar-placeholder.png"} alt="User avatar" />
        </div>
      </div>
      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className='relative w-72 mx-auto'>
            <IoCloseSharp
              className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={() => setImg(null)}
            />
            <img src={URL.createObjectURL(img)} className='w-full mx-auto h-72 object-contain rounded' alt="Selected image" />
          </div>
        )}

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>
          <input type='file' hidden ref={imgRef} onChange={handleImgChange} />
          <button type='submit' className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className='text-red-500'>Something went wrong</div>}
      </form>
    </div>
  );
};

export default CreatePost;
