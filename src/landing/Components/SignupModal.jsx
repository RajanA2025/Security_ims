import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, User } from 'lucide-react';

const SignupModal = ({ isOpen = false, onClose }) => {
   const navigate = useNavigate(); 
   const handleCandidateClick = () => {
    onClose();
    navigate('/candidate-register');
  };
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to IMS</h2>
            <p className="text-slate-600">Choose your account type to get started</p>
          </div>
          
          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-3 bg-[#181ed4] text-white font-semibold py-4 px-6 rounded-xl hover:bg-[#1318a9] hover:shadow-lg transition-all duration-300"
              onClick={handleCandidateClick}
            >
              <User className="h-5 w-5" />
              <span>I'm a Candidate</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-3 bg-slate-100 text-slate-800 font-semibold py-4 px-6 rounded-xl hover:bg-slate-200 transition-all duration-300"
            >
              <Building className="h-5 w-5" />
              <span>I'm a Company</span>
            </motion.button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              By signing up, you agree to our{' '}
              <a href="#" className="text-[#181ed4] hover:underline">TeIMS of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#181ed4] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;