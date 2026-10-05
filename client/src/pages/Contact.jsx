import React, { useState } from 'react';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order Help',
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
      subject: 'Order Help',
      message: ''
    });
  };

  return (
    <div className="py-10 space-y-12">
      {/* Header / Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Get in Touch with <span className="text-primary">GreenCart</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Have questions about your grocery order, fresh produce quality, delivery status, or seller panel? We're here to help!
        </p>
      </div>

      {/* Quick Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-emerald-50/50 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            📦
          </div>
          <h3 className="font-semibold text-lg text-gray-800">Order & Delivery Support</h3>
          <p className="text-sm text-gray-600">
            Track your order status or report any delivery issues directly through your account.
          </p>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            Mon - Sat (8 AM - 10 PM)
          </span>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-emerald-50/50 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            🥬
          </div>
          <h3 className="font-semibold text-lg text-gray-800">Freshness Guarantee</h3>
          <p className="text-sm text-gray-600">
            Handpicked fruits, vegetables, and dairy items delivered fresh to your doorstep.
          </p>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            Quality Assured
          </span>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-emerald-50/50 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            🏪
          </div>
          <h3 className="font-semibold text-lg text-gray-800">Seller & Partner Queries</h3>
          <p className="text-sm text-gray-600">
            Are you a vendor wanting to list grocery products on GreenCart? Reach out to us.
          </p>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            Seller Portal
          </span>
        </div>
      </div>

      {/* Main Contact Form & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-3 border border-gray-200 rounded-2xl p-6 md:p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Send Us a Message</h2>
          <p className="text-sm text-gray-500 mb-6">Fill out the form below and our customer care team will respond promptly.</p>
          
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
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm bg-white"
              >
                <option value="Order Help">Order & Delivery Help</option>
                <option value="Product Issue">Product Quality Inquiry</option>
                <option value="Payment Inquiry">Payment / Refund Status</option>
                <option value="Seller Inquiry">Seller / Vendor Registration</option>
                <option value="General Feedback">General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Write your message or order inquiry here..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:border-primary transition text-sm resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary-dull text-white font-medium text-sm rounded-lg transition cursor-pointer shadow"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Info & FAQ Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Direct Contact Channels</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-base">📧</span>
                <div>
                  <p className="font-medium text-gray-800">Support Email</p>
                  <p className="text-gray-600">support@greencart.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">📞</span>
                <div>
                  <p className="font-medium text-gray-800">Customer Care</p>
                  <p className="text-gray-600">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">💳</span>
                <div>
                  <p className="font-medium text-gray-800">Payment Options</p>
                  <p className="text-gray-600">Online Payment (Stripe) & Cash on Delivery (COD)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg text-gray-800">Frequently Asked Questions</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-800">Q: How can I track my grocery order?</p>
                <p className="text-gray-600 text-xs mt-1">
                  Log in to your GreenCart account and click on <strong>'My Orders'</strong> from the top profile menu to check live status.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-800">Q: How do I add or manage delivery address?</p>
                <p className="text-gray-600 text-xs mt-1">
                  You can add your address during checkout or save your address details under the address section before placing orders.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-800">Q: Want to sell your grocery products on GreenCart?</p>
                <p className="text-gray-600 text-xs mt-1">
                  Access the Seller Dashboard via the seller login to manage and add new products easily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
