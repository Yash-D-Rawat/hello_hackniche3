import React from 'react';
import collaboration from '../assets/collaboration.png';
import storybook from '../assets/storybookcopy.png'; // Assume you have an image for Storybook
import blogs from '../assets/blogs.png'; // Assume you have an image for Blogs
import storybookcopy from '../assets/storybookcopy.png'; // Assume you have an image for Storybook Copy

const FeaturesSection = () => {
  return (
    <div className='w-full flex flex-col items-center py-10 bg-white'>
      <h1 className='text-3xl font-bold mb-5 text-purple'>What does the Copilot provide?</h1>
      <div className='w-full flex justify-evenly items-center text-white'>
        {/* Collaboration Section */}
        <div className='bg-darkblue w-[27%] flex flex-col items-center gap-5 rounded-xl p-10'>
          <img src={collaboration} alt='collaboration' className='w-[50%]' />
          <h2 className='font-bold text-3xl'>Collaboration</h2>
          <p className='w-full text-center'>
            Seamlessly work together with your team, share ideas, and create the best content with ease.
          </p>
        </div>

        {/* Storybook Section */}
        <div className='bg-darkblue w-[27%] flex flex-col items-center gap-5 rounded-xl p-10'>
          <img src={storybookcopy} alt='storybook' className='w-[47%] ' />
          <h2 className='font-bold text-3xl'>Storybook</h2>
          <p className='w-full text-center'>
            Organize and present your ideas, design user interfaces, and share interactive stories with your team.
          </p>
        </div>

        {/* Blogs Section */}
        <div className='bg-darkblue w-[27%] flex flex-col items-center gap-5 rounded-xl p-10'>
          <img src={blogs} alt='blogs' className='w-[64%]' />
          <h2 className='font-bold text-3xl'>Blogs</h2>
          <p className='w-full text-center'>
            Create and manage blogs, engage with your audience, and share insightful content in an easy-to-use platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeaturesSection;