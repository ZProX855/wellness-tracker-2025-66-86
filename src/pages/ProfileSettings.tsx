
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { toast } from 'sonner';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar);
    }
  }, [user]);
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 2MB.');
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to upload image. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const removeAvatar = () => {
    setAvatar(undefined);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await updateProfile({
        name,
        avatar,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if there's an error, we want to redirect to login
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-wellness-darkGreen hover:text-wellness-mediumGreen transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-2xl p-8 border border-wellness-softGreen/30 shadow-sm">
            <h1 className="text-2xl font-medium text-wellness-darkGreen mb-6">Profile Settings</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {isUploading ? (
                    <div className="w-32 h-32 rounded-full bg-wellness-softGreen/20 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : avatar ? (
                    <div className="relative group">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-wellness-softGreen/30 cursor-pointer"
                        onClick={handleAvatarClick}
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 rounded-full bg-wellness-softGreen/20 flex items-center justify-center cursor-pointer hover:bg-wellness-softGreen/30 transition-colors"
                      onClick={handleAvatarClick}
                    >
                      <User className="h-16 w-16 text-wellness-darkGreen/70" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className={`absolute bottom-0 right-0 bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white rounded-full p-2 shadow-md ${avatar ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <p className="mt-2 text-sm text-wellness-charcoal/70">
                  Click to upload a profile picture
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2 border border-wellness-softGreen/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-wellness-mediumGreen text-wellness-darkGreen"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-wellness-charcoal mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="block w-full px-4 py-2 border border-wellness-softGreen/40 rounded-lg bg-wellness-softGreen/10 text-wellness-charcoal/70 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-wellness-charcoal/50">
                  Username cannot be changed
                </p>
              </div>
              
              <div className="pt-4 border-t border-wellness-softGreen/30">
                <button
                  type="submit"
                  className="w-full bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full mt-4 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Logging out...
                    </>
                  ) : (
                    'Log Out'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
