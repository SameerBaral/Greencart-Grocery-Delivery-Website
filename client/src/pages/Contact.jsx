import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Thank you for contacting GreenCart! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Get in Touch with <span className="text-primary">GreenCart</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Have a question, suggestion, or feedback? Send us a message below.
        </p>
      </div>

      {/* Simplified Contact Form */}
      <div className="border border-gray-200 rounded-2xl p-6 md:p-10 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-3">
          Contact Form
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject here..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              placeholder="Write your message here..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dull text-white font-medium text-sm rounded-lg transition cursor-pointer shadow"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
