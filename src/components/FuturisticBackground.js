import React from 'react';
import { Box } from '@mui/material';

const FuturisticBackground = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background gradient */}
      <Box sx={{
        position: 'absolute',
        inset: '-20%',
        background: `
          radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.15), transparent 60%),
          radial-gradient(900px 500px at 80% 20%, rgba(16,185,129,0.12), transparent 55%),
          radial-gradient(700px 500px at 50% 80%, rgba(168,85,247,0.10), transparent 60%),
          linear-gradient(120deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))
        `,
        filter: 'blur(40px)',
        animation: 'gradientShift 18s ease infinite',
        backgroundSize: '200% 200%',
        zIndex: 0
      }} />

      {/* Floating blobs */}
      <Box sx={{
        position: 'absolute',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        filter: 'blur(50px)',
        opacity: 0.35,
        background: 'radial-gradient(circle at 30% 30%, #6366f1, transparent 60%)',
        top: '-60px',
        left: '-80px',
        animation: 'float 10s ease-in-out infinite',
        zIndex: 0
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        filter: 'blur(50px)',
        opacity: 0.35,
        background: 'radial-gradient(circle at 70% 70%, #10b981, transparent 60%)',
        bottom: '-80px',
        right: '-60px',
        animation: 'float 12s ease-in-out infinite',
        zIndex: 0
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        filter: 'blur(50px)',
        opacity: 0.35,
        background: 'radial-gradient(circle at 70% 30%, #a855f7, transparent 60%)',
        top: '20%',
        right: '20%',
        animation: 'float 14s ease-in-out infinite',
        zIndex: 0
      }} />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default FuturisticBackground;
