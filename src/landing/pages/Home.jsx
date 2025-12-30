import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Building, BarChart3, Clock, Shield, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';

const testimonials = [
  {
    name: 'Mr John',
    role: 'CEO  EY',
    text: 'IMS made our hiring process so much faster and easier. The interface is beautiful and intuitive!',
    image: 'https://tse1.mm.bing.net/th/id/OIP.8aZ5kSjafxxeT-lSqH9e3wHaE7?pid=ImgDet&rs=1',
  },
  {
    name: 'Mr Chen',
    role: 'CEO  Microsoft',
    text: 'The analytics and automation features are a game changer. Highly recommended!',
    image: 'https://as1.ftcdn.net/v2/jpg/01/87/23/18/1000_F_187231831_ffCdMAagjKY3q0kdn5LVC7MMNHRM2gSX.jpg',
  },
  {
    name: 'Mr Michael',
    role: 'CEO  Amazon',
    text: 'We love how IMS adapts to our workflow and helps us find the best candidates.',
    image: 'https://images.squarespace-cdn.com/content/v1/53b599ebe4b08a2784696956/1612833792250-QQXS6X2QIY39IU4A57IS/CEO+Remote+photoshoot+9.jpg',
  },
];

const features = [
  {
    icon: <Users className="h-7 w-7" />, // slightly larger
    title: 'Smart Asset Management',
    description: 'Track, monitor, and optimize all your IT assets from a single dashboard.',
    image: 'https://via.placeholder.com/120x80?text=Smart',
  },
  {
    icon: <Building className="h-7 w-7" />,
    title: '',
    description: 'Manage multiple companies and departments seamlessly',
    image: 'https://via.placeholder.com/120x80?text=Multi',
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Advanced Analytics',
    description: 'Real-time insights and performance metrics',
    image: 'https://via.placeholder.com/120x80?text=Analytics',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] text-white overflow-hidden flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-12 md:py-20">
        {/* Text Content */}
        <div className="z-10 flex-1 max-w-xl md:pr-8 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg"
          >
            Simplify <span className="text-[#ffd700]">Infrastructure</span> with <span className="text-[#ffd700]">IMS</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-lg md:text-2xl text-white/90 mb-8 max-w-lg mx-auto md:mx-0"
          >
Your complete solution for smarter, faster, and more efficient IT infrastructure management.          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button
              onClick={() => navigate('/candidate-register')}
              className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 bg-transparent border border-white text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-white hover:text-[#181ed4] transition-all duration-300"
            >
              Learn More
            </button>
          </motion.div>
        </div>
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0"
        >
          <img
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=720&q=80"
            alt="Modern office team collaboration"
            className="rounded-3xl shadow-2xl w-full max-w-md object-cover border-4 border-white/20"
          />
        </motion.div>
        {/* Decorative Blur */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 w-full md:w-3/4 mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">Why Choose IMS?</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Built for modern IT & operations teams who want to manage infrastructure with ease, visibility, and control.            </p>
          </motion.div>
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  ...features[0],
                  image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
                },
                {
                  ...features[1],
                  image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
                },
                {
                  ...features[2],
                  image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left flex flex-col items-start"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-200"
                  />
                  <div className="bg-[#0026c0] w-12 h-12 rounded-lg flex items-center justify-center text-white mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 w-full md:w-3/4 mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">What Our Users Say</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by HR professionals and recruiters worldwide.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="bg-gray-50 p-6 rounded-2xl shadow-md flex flex-col items-center text-center"
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-16 h-16 rounded-full mb-3 border-2 border-[#181ed4] object-cover"
                />
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3">"{t.text}"</p>
                <div className="font-semibold text-[#181ed4]">{t.name}</div>
                <div className="text-gray-500 text-sm">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-[#0026c0] to-[#6a82fb] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1200x400?text=CTA+Background')] bg-cover bg-center opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg"
          >
            Ready to Transform Your Aws?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-lg md:text-xl mb-6 max-w-2xl text-white/90"
          >
            Join thousands of companies already using IMS to hire better talent faster.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            onClick={() => navigate('/candidate-register')}
            className="bg-white text-[#0026c0] font-bold py-3 px-8 rounded-xl text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
