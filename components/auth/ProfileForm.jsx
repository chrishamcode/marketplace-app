import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/users/profile');
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const data = await response.json();
          setProfile(data.user);
          
          // Initialize form with profile data
          setFormData({
            name: data.user.name || '',
            phone: data.user.phone || '',
            location: data.user.location || ''
          });
          
        } catch (error) {
          console.error('Error fetching profile:', error);
          setErrors({ form: error.message });
        }
      }
    };
    
    fetchProfile();
  }, [status]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setMessage(data.message || 'Profile updated successfully');
      setProfile(data.user);
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading' || !profile) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-center">Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{profile.email}</p>
        
        <div className="mt-2 flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${profile.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-sm">{profile.isVerified ? 'Verified Account' : 'Email not verified'}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your city or area"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Updating Profile...' : 'Update Profile'}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-2">Account Information</h3>
        <div className="text-sm text-gray-600">
          <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
          <p>Trust Score: {profile.trustScore}</p>
        </div>
      </div>
    </div>
  );
}
