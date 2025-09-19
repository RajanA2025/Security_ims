import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1.2,
      ease: 'linear',
    },
  },
};

const Preloader = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#181ed4] via-[#3a47d5] to-[#6a82fb] animate-gradient-move"
            style={{ zIndex: 1 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Glassmorphism Loader Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center justify-center px-10 py-12 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20"
          >
            {/* Spinner */}
            <motion.div
              className="mb-8 flex items-center justify-center"
              variants={spinnerVariants}
              animate="animate"
            >
              <div className="w-16 h-16 border-4 border-t-white border-b-white border-l-transparent border-r-transparent rounded-full" style={{ boxShadow: '0 0 32px 0 rgba(255,255,255,0.15)' }} />
            </motion.div>
            {/* Brand Title */}
            <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2 tracking-wide">IMS</h1>
            <p className="text-white/80 text-lg mb-4 font-medium">by JIT Global Info Systems</p>
            {/* Loading Message */}
            <motion.p
              className="text-white/70 text-base mt-2 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Loading, please wait...
            </motion.p>
            {/* Progress Bar */}
            <motion.div
              className="mt-6 w-48 h-1 bg-white/20 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '12rem' }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;