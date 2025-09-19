import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, BarChart3, Search, Calendar, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Solutions = () => {
  const navigate = useNavigate();
  const solutions = [
    {
      id: 'hr-teams',
      icon: <Users className="h-12 w-12" />,
      title: 'For HR Teams',
      description: 'Streamline your recruitment process with powerful tools designed for HR professionals.',
      features: [
        'Centralized Job Posting & Management',
        'Advanced Candidate Filtering',
        'Automated Interview Scheduling',
        'Collaborative Hiring Workflows',
        'Custom Approval Processes',
        'Integrated Communication Tools'
      ]
    },
    {
      id: 'management',
      icon: <Building className="h-12 w-12" />,
      title: 'For Management',
      description: 'Get complete visibility into your hiring process with comprehensive analytics and reporting.',
      features: [
        'Real-time Hiring Dashboards',
        'Performance Analytics & KPIs',
        'Budget & Cost Tracking',
        'Team Performance Metrics',
        'Predictive Hiring Insights',
        'Executive Reporting'
      ]
    },
    {
      id: 'candidates',
      icon: <Search className="h-12 w-12" />,
      title: 'For Candidates',
      description: 'Provide an exceptional candidate experience with intuitive application and tracking tools.',
      features: [
        'Simple Application Process',
        'Real-time Status Updates',
        'Interview Scheduling Portal',
        'Document Management',
        'Mobile-friendly Interface',
        'Feedback & Communication'
      ]
    }
  ];

  const processes = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Job Posting',
      description: 'Create and publish job listings across multiple platfoIMS'
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Candidate Sourcing',
      description: 'AI-powered matching and candidate discovery'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Interview Management',
      description: 'Automated scheduling and interview coordination'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Decision Making',
      description: 'Data-driven hiring decisions with analytics'
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Onboarding',
      description: 'Seamless transition from hiring to onboarding'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered */}
      <section className="relative bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] text-white py-8 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="block">Solutions for Every <span className="text-[#ffd700]">Stakeholder</span></span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl">
            IMS provides tailored solutions for HR teams, management, and candidates, ensuring a seamless experience for everyone involved in the hiring process.
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

      {/* Solutions Grid - Left Aligned */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              A Solution for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              IMS is designed to streamline the recruitment process for every stakeholder involved.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-[#0026c0] p-6 text-white">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-2">
                    {solution.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{solution.title}</h3>
                  <p className="text-white/90">{solution.description}</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow - Left Aligned */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Streamlined Hiring Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              From job posting to onboarding, IMS guides you through every step of the recruitment journey.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {processes.map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-[#0026c0] w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-2">
                  {process.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{process.title}</h3>
                <p className="text-gray-600 text-sm">{process.description}</p>
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
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl mb-4 max-w-2xl text-white/90">
              See how IMS can transform your hiring process with our comprehensive solutions.
            </p>
            <button
              onClick={() => navigate('/candidate-register')}
              className="inline-flex items-center gap-2 bg-white text-[#181ed4] font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:bg-[#181ed4] hover:text-white transition-all duration-300 mb-0"
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

export default Solutions;