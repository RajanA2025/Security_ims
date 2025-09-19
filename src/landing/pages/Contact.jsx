import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ArrowRight, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Add styles for the highlight effect
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
  @keyframes highlight {
    0% { box-shadow: 0 0 0 0 rgba(24, 30, 212, 0.5); }
    50% { box-shadow: 0 0 0 10px rgba(24, 30, 212, 0); }
    100% { box-shadow: 0 0 0 0 rgba(24, 30, 212, 0); }
  }
  .highlight-form {
    animation: highlight 1.5s ease-out;
  }
`;
document.head.appendChild(highlightStyle);

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', company: '', message: '' });
    setSent(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      content: '+91 78100 99942',
      href: 'tel:+917810099942'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      content: 'sales@jitglobalinfosystems.com',
      href: 'mailto:sales@jitglobalinfosystems.com'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Address',
      content: '2/181, AGS Colony, Phase – 3, 1st floor, 4th Avenue, Mugalivakkam, Chennai - 600125',
      href: 'https://maps.google.com/?q=2/181, AGS Colony, Phase – 3, 1st floor, 4th Avenue, Mugalivakkam, Chennai - 600125'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
      href: null
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to implement IMS?',
      answer: 'Implementation typically takes 2-4 weeks depending on your specific requirements and customizations.'
    },
    {
      question: 'Do you provide training for our team?',
      answer: 'Yes, we provide comprehensive training for all users, including administrators and end-users.'
    },
    {
      question: 'Is IMS suitable for small businesses?',
      answer: 'Absolutely! IMS scales with your business, from startups to enterprise organizations.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We provide 24/7 technical support, regular updates, and dedicated account management.'
    }
  ];

  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => setSent(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [sent]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] text-white overflow-hidden flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-12 md:py-20">
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 max-w-xl md:pr-8 text-center md:text-left"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Get in <span className="text-[#ffd700]">Touch</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-lg mx-auto md:mx-0">
            Ready to transform your recruitment process? Let's discuss how IMS can help your organization hire better talent faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => {
                const contactForm = document.getElementById('contact-form');
                if (contactForm) {
                  // Calculate the header height dynamically
                  const header = document.querySelector('header');
                  const headerHeight = header ? header.offsetHeight : 80;
                  
                  // Get the form's position relative to the viewport
                  const formRect = contactForm.getBoundingClientRect();
                  
                  // Calculate the scroll position, accounting for header height and some padding
                  const y = window.scrollY + formRect.top - headerHeight - 20;
                  
                  // Scroll to the calculated position with smooth behavior
                  window.scrollTo({ top: y, behavior: 'smooth' });
                  
                  // Add a class to highlight the form after scroll
                  contactForm.classList.add('highlight-form');
                  setTimeout(() => {
                    contactForm.classList.remove('highlight-form');
                  }, 2000);
                }
              }}
              className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300"
            >
              Connect Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </motion.div>
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0 relative"
        >
          <img
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=720&q=80"
            alt="Contact IMS - Modern office team collaboration"
            className="rounded-3xl shadow-2xl w-full max-w-md object-cover border-4 border-white/20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181ed4]/80 to-transparent rounded-3xl" style={{ pointerEvents: 'none' }} />
        </motion.div>
        {/* Decorative Blur */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Contact Form & Info */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Success Message Animation */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={sent ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center sticky top-0 z-20"
              style={{ pointerEvents: 'none', minHeight: sent ? 48 : 0 }}
            >
              {sent && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-xl shadow flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Message sent successfully!
                </div>
              )}
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Form */}
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col justify-center transition-all duration-300"
              style={{
                boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)'
              }}
              // Add smooth transition for the highlight effect
              onAnimationEnd={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 0, 0, 0)';
              }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                        <Mail className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                        <Mail className="h-5 w-5" />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                      <Building className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your company name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-4 text-blue-400">
                      <Send className="h-5 w-5" />
                    </span>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-600 mb-2">
                  We're here to help you succeed. Reach out to us through any of these channels.
                </p>
              </div>

              <div className="space-y-2">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-lg flex items-start space-x-4"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          target={info.href.startsWith('http') ? '_blank' : undefined}
                          rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">{info.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get quick answers to common questions about IMS and our services.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Visit Our Office</h2>
            <p className="text-xl text-gray-600">
              We'd love to meet you in person. Find us at our Chennai office.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Interactive Map Coming Soon</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;