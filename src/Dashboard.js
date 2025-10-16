import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useGetIdentity, useTranslate, useDataProvider } from 'react-admin';

const Dashboard = () => {
  const { data: user } = useGetIdentity();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeTeachers: 0,
    availableTariffs: 0,
    totalLessons: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await dataProvider.getDashboardStats();

        setStats({
          totalStudents: statsData.totalStudents,
          activeTeachers: statsData.totalTeachers,
          availableTariffs: statsData.availableTariffs,
          totalLessons: statsData.totalLessons
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [dataProvider]);

  return (
    <Box sx={{ 
      padding: '2em',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating blobs background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
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
          animation: 'float 10s ease-in-out infinite'
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
          animation: 'float 12s ease-in-out infinite'
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
          animation: 'float 14s ease-in-out infinite'
        }} />
      </Box>

      <Card
        sx={{
          maxWidth: 800,
          margin: '0 auto 2em auto',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1,
          backgroundImage: 'url(https://source.unsplash.com/800x200/?school)',
          backgroundSize: 'cover',
          color: 'white',
        }}
      >
        <CardContent
          sx={{
            background: 'rgba(0,0,0,0.5)',
            padding: '2em',
            borderRadius: '16px',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#e5e7eb', fontWeight: 700 }}>
            {translate('page.dashboard')}{user ? `, ${user.fullName || user.name}` : ''}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#e5e7eb' }}>
            {translate('page.dashboardSubtitle')}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ 
        maxWidth: 800, 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#e5e7eb', fontWeight: 700 }}>
            📊 {translate('page.quickStats')}
          </Typography>
          <Box component="ul" sx={{ color: '#e5e7eb', listStyle: 'none', padding: 0 }}>
            <Box component="li" sx={{ 
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              {translate('page.totalStudents')}: {loading ? '...' : stats.totalStudents}
            </Box>
            <Box component="li" sx={{ 
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              {translate('page.activeTeachers')}: {loading ? '...' : stats.activeTeachers}
            </Box>
            <Box component="li" sx={{ 
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              {translate('page.availableTariffs')}: {loading ? '...' : stats.availableTariffs}
            </Box>
            <Box component="li" sx={{ 
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              {translate('page.totalLessons')}: {loading ? '...' : stats.totalLessons}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;