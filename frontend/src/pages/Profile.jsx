import React, { useState } from "react";
import image from "../assets/image.png";
import {
  MapPin,
  Users,
  UserCircle2,
  Edit2,
  BookOpen,
  PenTool,
  Calendar,
  Activity,
  TrendingUp,
  Medal,
  UserPlus,
  Clock,
  Award,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Bookmark,
  Save,
  X
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import RecentDocuments from "./RecentDocuments";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Emily Carter",
    username: "emilywrites",
    bio: "✍ Creative Writer | 📖 Storyteller | 📰 Freelance Journalist\n\"Words have the power to change the world.\"",
    location: "New York, NY",
    followers: 3800,
    following: 1900,
    profileImage: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop"
  });

  const [editFormData, setEditFormData] = useState({...profileData});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setProfileData({...editFormData});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditFormData({...profileData});
    setIsEditing(false);
  };

  // Stats data
  const stats = [
    { label: "Documents", value: 124, icon: <BookOpen className="w-5 h-5" /> },
    { label: "Articles", value: 87, icon: <PenTool className="w-5 h-5" /> },
    { label: "Publications", value: 23, icon: <Calendar className="w-5 h-5" /> },
    { label: "Views", value: "52K", icon: <Activity className="w-5 h-5" /> },
  ];

  const achievements = [
    "Top Writer 2024",
    "Editor's Choice Award",
    "Featured Author - May 2024",
    "10,000 Reads Club"
  ];

  const recentActivities = [
    { action: "Published new article", title: "The Future of AI Writing", time: "2 hours ago" },
    { action: "Updated document", title: "Creative Writing Workshop", time: "1 day ago" },
    { action: "Commented on", title: "Digital Storytelling Techniques", time: "3 days ago" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-blue text-white pl-22">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button 
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg"
                onClick={() => !isEditing && setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            
            {isEditing ? (
              <div className="flex-1 bg-white p-6 rounded-lg shadow-md text-gray-800">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Edit Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editFormData.username}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Profile Image URL</label>
                  <input
                    type="text"
                    name="profileImage"
                    value={editFormData.profileImage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.name}</h1>
                    <p className="text-blue-200 font-medium">@{profileData.username}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-700 rounded-full font-semibold shadow-lg hover:bg-blue-50 transition"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <p className="mb-4 text-lg font-medium whitespace-pre-line">
                  {profileData.bio}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">{profileData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-bold">{profileData.followers.toLocaleString()}</span> followers
                  </div>
                  <div className="flex items-center">
                    <UserCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-bold">{profileData.following.toLocaleString()}</span> following
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Stats section */}
            
            
           <RecentDocuments/>
            
            {/* Recent Activity */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                <a href="#" className="text-blue-600 hover:underline text-sm">View All</a>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {index === 0 ? <PenTool size={20} /> : index === 1 ? <Edit2 size={20} /> : <MessageCircle size={20} />}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-800">
                        <span className="font-medium">{activity.action}</span> <a href="#" className="text-blue-600 hover:underline">{activity.title}</a>
                      </p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
          
          {/* Right column */}
          <div>
            {/* Achievements */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                <Medal className="w-5 h-5 inline mr-2 text-blue-600" />
                Achievements
              </h2>
              <ul className="space-y-3">
                {achievements.map((achievement, index) => (
                  <li key={index} className="flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-gray-800">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Suggested Connections */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                <UserPlus className="w-5 h-5 inline mr-2 text-blue-600" />
                People to Follow
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                         src={image} 
                        alt="User" 
                        className="w-10 h-10 rounded-full mr-3" 
                      />
                      <div>
                        <p className="font-medium text-gray-800">Alex Johnson</p>
                        <p className="text-gray-500 text-sm">Content Creator</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bookmarked Content */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                <Bookmark className="w-5 h-5 inline mr-2 text-blue-600" />
                Bookmarked
              </h2>
              <div className="space-y-3">
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <p className="font-medium text-gray-800">How to Craft Compelling Characters</p>
                  <p className="text-gray-500 text-sm">by Sarah Williams • 10 min read</p>
                </a>
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <p className="font-medium text-gray-800">The Art of Dialogue Writing</p>
                  <p className="text-gray-500 text-sm">by James Peterson • 8 min read</p>
                </a>
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <p className="font-medium text-gray-800">Storytelling in the Digital Age</p>
                  <p className="text-gray-500 text-sm">by Morgan Lee • 15 min read</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Profile;