import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, Globe, Zap, Heart, Target, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleContactChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setFormData({ name: '', email: '', company: '', message: '' });
    setTimeout(() => setSent(false), 2500);
    setTimeout(() => setIsContactModalOpen(false), 2600);
  };

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'People First',
      description: 'We believe great companies are built by great people. Our mission is to help you find them.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Innovation',
      description: 'Continuously pushing the boundaries of what\'s possible in recruitment technology.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Results Driven',
      description: 'Every feature we build is designed to deliver measurable improvements to your hiring process.',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Impact',
      description: 'Empowering companies worldwide to build diverse, talented teams that drive success.',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const stats = [
    { number: '10+', label: 'Years Experience' },
    { number: '500+', label: 'Companies Served' },
    { number: '50K+', label: 'Successful Hires' },
    { number: '99%', label: 'Client Satisfaction' }
  ];

  const team = [
    {
      name: 'Dr N. Marie Wilson',
      role: 'CEO & Founder',
      bio: 'Former VP of Talent at Fortune 500 companies, PhD in Industrial Psychology',
      image: 'https://jitglobalinfosystems.com/wp-content/uploads/2020/01/Founder.webp'
    },
    {
      name: 'Karthik Palani',
      role: 'CTO',
      bio: 'Former Lead Engineer at Google, 15+ years in enterprise software development',
      image: 'https://jitglobalinfosystems.com/wp-content/uploads/2020/01/cto.webp'
    },
    {
      name: 'Easwar Sivanandam',
      role: 'Head of Product',
      bio: 'Product strategy expert with deep understanding of HR workflows and user experience',
      image: 'https://media.licdn.com/dms/image/v2/C5103AQG1u6Zlv2YExA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1550749232316?e=2147483647&v=beta&t=lWzcCtAOROHMTSJTLDyRPaSnwZHZvy0DmNuj59_-klc'
    }
  ];

  const milestones = [
    {
      year: '2011',
      title: 'Company Founded',
      description: 'JIT Global Info Systems established with a vision to transform IT solutions'
    },
    {
      year: '2018',
      title: 'AWS Partner',
      description: 'JIT Global Info Systems established with a vision to transform IT solutions'
    },
    {
      year: '2020',
      title: 'AWS Partner',
      description: 'JIT Global Info Systems established with a vision to transform IT solutions'
    },
    {
      year: '2024',
      title: 'AWS Advanced Partner',
      description: 'JIT Global Info Systems established with a vision to transform IT solutions'
    }
  ];

  // Compact modal style variables
  const modalPadding = 'p-4 sm:p-6';
  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400';
  const buttonClass = 'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center text-base';

  // Add bounce animation for success message
  const bounceAnim = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1.1 },
    exit: { opacity: 0, y: 10, scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 10, duration: 0.5 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered */}
      <section className="relative bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] text-white overflow-hidden flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-12 md:py-20">
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 max-w-xl md:pr-8 text-center md:text-left"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            About <span className="text-[#ffd700]">JIT Global Info Systems</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-lg mx-auto md:mx-0">
            For over a decade, we've been at the forefront of IT innovation, helping businesses transform their operations with cutting-edge technology solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate('/candidate-register')}
              className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300"
            >
              Get Started
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
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=720&q=80"
            alt="About JIT Global Info Systems - Office Collaboration"
            className="rounded-3xl shadow-2xl w-full max-w-md object-cover border-4 border-white/20"
          />
        </motion.div>
        {/* Decorative Blur */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { ...stats[0], icon: <Award className="h-8 w-8 text-[#181ed4] mb-2 mx-auto" /> },
              { ...stats[1], icon: <Users className="h-8 w-8 text-[#181ed4] mb-2 mx-auto" /> },
              { ...stats[2], icon: <CheckCircle className="h-8 w-8 text-[#181ed4] mb-2 mx-auto" /> },
              { ...stats[3], icon: <Globe className="h-8 w-8 text-[#181ed4] mb-2 mx-auto" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                {stat.icon}
                <div className="text-4xl md:text-5xl font-bold text-[#181ed4] mb-2">
                  {stat.number}
                </div>
                <div className="text-[#181ed4] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-4"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#181ed4] mb-2">Our Mission</h2>
              <p className="text-xl text-[#181ed4] leading-relaxed">
                We're committed to helping businesses modernize their IT operations, enhance security, and drive scalable, cost-effective technology solutions to achieve long-term growth. Our IMS platform represents our dedication to transforming how companies find and hire the best talent.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-[#181ed4] mb-2">What We Do</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Cloud Infrastructure Services</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Cybersecurity Solutions</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Data Engineering Services</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Application Development</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Digital Transformation</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Recruitment Management Systems</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#181ed4] mb-2">Our Values</h2>
            <p className="text-xl text-[#181ed4] max-w-3xl mx-auto">
              The principles that guide everything we do and every solution we create.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-[#181ed4] rounded-2xl p-6 text-white text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-[#181ed4] mx-auto mb-2">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-8 bg-[#181ed4]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Our Journey</h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Key milestones in our mission to transform recruitment technology.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`bg-white rounded-2xl p-4 shadow-lg max-w-md ${index % 2 === 0 ? 'mr-2' : 'ml-2'}`}>
                    <div className="flex items-center mb-2">
                      <div className="bg-[#181ed4] text-white font-bold py-1 px-3 rounded-full text-sm">
                        {milestone.year}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#181ed4] mb-1">{milestone.title}</h3>
                    <p className="text-[#181ed4]">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#181ed4] mb-2">Leadership Team</h2>
            <p className="text-xl text-[#181ed4] max-w-3xl mx-auto">
              Meet the visionaries behind IMS and our innovative recruitment solutions.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                />
                <h3 className="text-xl font-bold text-[#181ed4] mb-1">{member.name}</h3>
                <p className="text-[#181ed4] font-medium mb-2">{member.role}</p>
                <p className="text-[#181ed4] text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-[#181ed4] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-4 max-w-2xl mx-auto text-white/90">
              Join the companies that trust JIT Global Info Systems for their technology needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                className="bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                onClick={() => navigate('/contact')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </button>
              {/* <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-white hover:text-[#181ed4] transition-all duration-300 transform hover:scale-105">
                Learn More
              </button> */}
            </div>
          </motion.div>
          {/* Animated Contact Modal */}
          <AnimatePresence>
            {isContactModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto"
                onClick={() => setIsContactModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 40, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-2xl shadow-2xl ${modalPadding} m-2 max-w-xs w-full relative my-8 flex flex-col justify-start`}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsContactModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ×
                  </button>
                  {/* Message sent popup at the top of the modal */}
                  <AnimatePresence>
                    {sent && (
                      <motion.div
                        {...bounceAnim}
                        className="mb-2 text-green-600 text-center font-semibold text-sm"
                        style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderRadius: '0.5rem' }}
                      >
                        Message sent successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="text-center mb-4 mt-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Send us a Message</h2>
                  </div>
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleContactChange}
                        required
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleContactChange}
                        required
                        className={inputClass}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleContactChange}
                        className={inputClass}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleContactChange}
                        required
                        rows={4}
                        className={inputClass + ' resize-none'}
                        placeholder="Tell us about your requirements..."
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={buttonClass}
                    >
                      Send Message
                    </motion.button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;