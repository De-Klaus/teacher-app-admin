import * as React from 'react';
import { Card, CardContent, Typography, Box, Grid, Avatar, LinearProgress, Button } from '@mui/material';
import { useGetIdentity, useTranslate, useDataProvider } from 'react-admin';
import { Link, Link as RouterLink } from 'react-router-dom';
import { 
  Person, 
  AttachMoney, 
  Book, 
  People,
  Work,
  Event as EventIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { data: userIdentity } = useGetIdentity();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeTeachers: 0,
    availableTariffs: 0,
    totalLessons: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [displayUser, setDisplayUser] = React.useState(null);

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

  // Load user first/last name from backend /users/{id}
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userIdentity?.id) return;
        const userDto = await dataProvider.getUserById(userIdentity.id);
        setDisplayUser(userDto);
      } catch (_) {
        setDisplayUser(null);
      }
    };
    fetchUser();
  }, [dataProvider, userIdentity]);


  return (
    <Box sx={{ 
      padding: '2em',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1021 0%, #1a1c3c 40%, #0b1026 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `,
        zIndex: -1,
      }
    }}>
      {/* Enhanced floating blobs background */}
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
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4,
          background: 'radial-gradient(circle at 30% 30%, #6366f1, transparent 60%)',
          top: '-100px',
          left: '-100px',
          animation: 'float 12s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.3,
          background: 'radial-gradient(circle at 70% 70%, #10b981, transparent 60%)',
          bottom: '-150px',
          right: '-150px',
          animation: 'float 15s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.5,
          background: 'radial-gradient(circle at 70% 30%, #a855f7, transparent 60%)',
          top: '20%',
          right: '20%',
          animation: 'float 18s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.6,
          background: 'radial-gradient(circle at 50% 50%, #f59e0b, transparent 60%)',
          top: '60%',
          left: '10%',
          animation: 'float 20s ease-in-out infinite'
        }} />
      </Box>

      {/* Welcome Card */}
      <Card
        sx={{
          maxWidth: 900,
          margin: '0 auto 2em auto',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.15) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.1) 100%)',
            zIndex: -1,
          }
        }}
      >
        <CardContent sx={{ padding: '3em' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1.5em' }}>
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
              marginRight: '1em',
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
            }}>
              <Person sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                color: '#e5e7eb', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e5e7eb 0%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.25em'
              }}>
                {translate('page.dashboard')}
                {displayUser && displayUser.firstName && displayUser.lastName ?
                  `, ${displayUser.firstName} ${displayUser.lastName}` :
                  userIdentity ? `, ${userIdentity.fullName || userIdentity.name}` : ''
                }!
          </Typography>
              <Typography variant="body1" sx={{ 
                color: '#9ca3af',
                fontSize: '1.1em',
                fontWeight: 500
              }}>
            {translate('page.dashboardSubtitle')}
          </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/calendar"
              variant="contained"
              startIcon={<EventIcon sx={{ color: '#06b6d4' }} />}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                color: '#0b1026',
                fontWeight: 700,
                borderRadius: '12px',
                padding: '10px 16px',
                textTransform: 'none',
                boxShadow: '0 10px 30px rgba(99,102,241,0.35)',
                '&:hover': {
                  transform: 'translateY(-1px) scale(1.02)',
                  filter: 'brightness(1.05)',
                },
              }}
            >
              {translate('page.calendar')}
            </Button>
          </Box>
          
          {loading && (
            <Box sx={{ marginTop: '1em' }}>
              <LinearProgress 
                sx={{ 
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)'
                  }
                }} 
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
        <Typography variant="h5" sx={{ 
          color: '#e5e7eb', 
          fontWeight: 700, 
          textAlign: 'center',
          marginBottom: '2em',
          background: 'linear-gradient(135deg, #e5e7eb 0%, #10b981 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
            {/* 📊 {translate('page.quickStats')} */}
          </Typography>
        
        <Grid container spacing={3}>
          {/* Students Card */}
          <Grid item xs={12} sm={6} md={3}>
          <Link to="/student-create" style={{ textDecoration: 'none' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '20px',
              boxShadow: '0 15px 50px rgba(99,102,241,0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 25px 70px rgba(99,102,241,0.3)',
              }
            }}>
              <CardContent sx={{ padding: '2em', textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  margin: '0 auto 1em auto',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
                }}>
                  <People sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  color: '#e5e7eb', 
                  fontWeight: 700,
                  marginBottom: '0.5em'
                }}>
                  {loading ? '...' : stats.totalStudents}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#9ca3af',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {translate('page.totalStudents')}
                </Typography>
              </CardContent>
            </Card>
            </Link>
          </Grid>

          {/* Teachers Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(34,197,94,0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '20px',
              boxShadow: '0 15px 50px rgba(16,185,129,0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 25px 70px rgba(16,185,129,0.3)',
              }
            }}>
              <CardContent sx={{ padding: '2em', textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  margin: '0 auto 1em auto',
                  boxShadow: '0 8px 32px rgba(16,185,129,0.4)'
                }}>
                  <Work sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  color: '#e5e7eb', 
                  fontWeight: 700,
                  marginBottom: '0.5em'
                }}>
                  {loading ? '...' : stats.activeTeachers}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#9ca3af',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {translate('page.activeTeachers')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tariffs Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '20px',
              boxShadow: '0 15px 50px rgba(245,158,11,0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 25px 70px rgba(245,158,11,0.3)',
              }
            }}>
              <CardContent sx={{ padding: '2em', textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  margin: '0 auto 1em auto',
                  boxShadow: '0 8px 32px rgba(245,158,11,0.4)'
                }}>
                  <AttachMoney sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  color: '#e5e7eb', 
                  fontWeight: 700,
                  marginBottom: '0.5em'
                }}>
                  {loading ? '...' : stats.availableTariffs}
          </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#9ca3af',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {translate('page.availableTariffs')}
          </Typography>
        </CardContent>
      </Card>
          </Grid>

          {/* Lessons Card */}
          <Grid item xs={12} sm={6} md={3}>
          <Link to="/lesson-work" style={{ textDecoration: 'none' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(196,181,253,0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '20px',
              boxShadow: '0 15px 50px rgba(168,85,247,0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 25px 70px rgba(168,85,247,0.3)',
              }
            }}>
                <CardContent sx={{ padding: '2em', textAlign: 'center' }}>
                  <Avatar sx={{ 
                    width: 60, 
                    height: 60, 
                    background: 'linear-gradient(135deg, #a855f7 0%, #c4b5fd 100%)',
                    margin: '0 auto 1em auto',
                    boxShadow: '0 8px 32px rgba(168,85,247,0.4)'
                  }}>
                    <Book sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    color: '#e5e7eb', 
                    fontWeight: 700,
                    marginBottom: '0.5em'
                  }}>
                    {loading ? '...' : stats.totalLessons}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#9ca3af',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {translate('page.totalLessons')}
          </Typography>
        </CardContent>
      </Card>
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;