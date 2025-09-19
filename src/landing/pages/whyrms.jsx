import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Shield, Users, Zap, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhyIMS = () => {
  const navigate = useNavigate();
  const benefits = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Faster Hiring',
      description: 'Reduce time-to-hire by up to 60% with automated workflows and smart matching.',
      stat: '60% faster'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Better Quality Hires',
      description: 'AI-powered candidate matching ensures better fit and higher retention rates.',
      stat: '40% better retention'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Reduced Costs',
      description: 'Lower recruiting costs through efficient processes and reduced dependency on external agencies.',
      stat: '50% cost reduction'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Enhanced Experience',
      description: 'Improve candidate experience with transparent communication and streamlined processes.',
      stat: '90% satisfaction'
    }
  ];

  const features = [
    {
      category: 'Smart Automation',
      items: [
        'Automated candidate screening and scoring',
        'Interview scheduling with calendar integration',
        'Customizable workflow automation',
        'Email templates and notifications'
      ]
    },
    {
      category: 'Advanced Analytics',
      items: [
        'Real-time hiring metrics and KPIs',
        'Predictive analytics for hiring trends',
        'Source effectiveness tracking',
        'Team performance dashboards'
      ]
    },
    {
      category: 'Seamless Integration',
      items: [
        'Job board integrations',
        'ATS and HRIS connectivity',
        'Calendar and email integration',
        'API for custom integrations'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'TechCorp Inc.',
      content: 'IMS transformed our hiring process completely. We\'ve reduced our time-to-hire by 50% while improving candidate quality.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Talent Acquisition Manager',
      company: 'Global Solutions',
      content: 'The analytics and reporting features give us insights we never had before. It\'s like having a hiring consultant built into our system.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'VP of People',
      company: 'StartupXYZ',
      content: 'As a growing startup, IMS scaled with us perfectly. The automation features saved us countless hours of manual work.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered */}
      <section className="relative bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] text-white py-8 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="block">Why Choose <span className="text-[#ffd700]">IMS?</span></span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl">
            Discover how IMS is revolutionizing recruitment with intelligent automation, advanced analytics, and seamless user experience.
          </p>
          <button
            onClick={() => navigate('/candidate-register')}
            className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Benefits Section - Left Aligned */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Measurable Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Join thousands of companies that have transformed their hiring process with IMS.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-[#0026c0] w-16 h-16 rounded-full flex items-center justify-center text-white mb-2">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-gray-600 mb-2">{benefit.description}</p>
                <div className="text-2xl font-bold text-[#0026c0]">
                  {benefit.stat}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Left Aligned */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Everything you need to streamline your hiring process and make better decisions.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.category}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Left Aligned */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Don't just take our word for it. Here's what HR professionals say about IMS.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-2 italic">"{testimonial.content}"</p>
                <div className="border-t pt-2">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Centered */}
      <section className="py-8 bg-[#0026c0] text-white">
        <div className="px-4 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl mb-4 max-w-2xl text-white/90">
              Join thousands of companies that have already revolutionized their recruitment process with IMS.
            </p>
            <button
              onClick={() => navigate('/candidate-register')}
              className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhyIMS;