import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useGetIdentity, useTranslate } from 'react-admin';

const Dashboard = () => {
  const { data: user } = useGetIdentity();
  const translate = useTranslate(); // добавляем переводчик

  return (
    <div style={{ padding: '2em' }}>
      <Card
        style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundImage: 'url(https://source.unsplash.com/800x200/?school)',
          backgroundSize: 'cover',
          color: 'white',
        }}
      >
        <CardContent
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '2em',
          }}
        >
          <Typography variant="h4" gutterBottom>
            {translate('page.dashboard')}{user ? `, ${user.fullName || user.name}` : ''}!
          </Typography>
          <Typography variant="body1">
            {translate('page.dashboardSubtitle')}
          </Typography>
        </CardContent>
      </Card>

      <Card style={{ maxWidth: 800, margin: '2em auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 {translate('page.quickStats')}
          </Typography>
          <ul>
            <li>{translate('page.totalStudents')}: 123</li>
            <li>{translate('page.activeTeachers')}: 15</li>
            <li>{translate('page.availableTariffs')}: 4</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;