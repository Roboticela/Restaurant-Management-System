import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPaperPlane, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';

interface SupportMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Support() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SupportMessage>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await invoke('send_support_email', { 
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setErrors({});
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      setErrorMessage(error as string || 'Failed to send message. Please try again.');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-fit mx-auto mb-6"
          >
            <FaEnvelope className="w-16 h-16 md:w-20 md:h-20 text-teal-400" />
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-purple-400 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Support & Contact
          </motion.h1>
          <p className="text-gray-300 mt-4 text-lg">
            Need help? Have questions? We're here for you!
          </p>
        </motion.div>

        {/* Support Form */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                      focus:outline-none transition-colors ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-600 focus:border-teal-400'
                      }`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                    focus:outline-none transition-colors ${
                      errors.subject 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-600 focus:border-teal-400'
                    }`}
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white 
                    focus:outline-none transition-colors resize-none ${
                      errors.message 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-600 focus:border-teal-400'
                    }`}
                  disabled={isSubmitting}
                  placeholder="Tell us how we can help you..."
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={handleBackNavigation}
                  className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold
                    transition-colors duration-200 flex items-center justify-center gap-2"
                  disabled={isSubmitting || isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <MdArrowBack className="text-xl" />
                      Back
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  type="submit"
                  className="flex-2 py-3 bg-linear-to-r from-teal-400 to-purple-400 text-white rounded-xl 
                    font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xl" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Alternative Support Options */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Other Ways to Get Help</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">GitHub Issues:</strong> Report bugs or request features on our{' '}
                <a 
                  href="https://github.com/Roboticela/restaurant-management-system/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400! hover:text-purple-400! underline! transition-colors duration-200 font-semibold"
                >
                  GitHub Issues page
                </a>
              </p>
              <p>
                <strong className="text-white">App Website:</strong> Visit our official website at{' '}
                <a 
                  href="https://github.com/Roboticela/restaurant-management-system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400! hover:text-purple-400! underline! transition-colors duration-200 font-semibold"
                >
                  Restaurant Management System
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 
            rounded-xl flex items-center gap-2"
        >
          <FaCheck className="text-xl" />
          Message sent successfully! We'll get back to you soon.
        </motion.div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 
            rounded-xl flex items-center gap-2 max-w-md"
        >
          <FaExclamationTriangle className="text-xl" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

