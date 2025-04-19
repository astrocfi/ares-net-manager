import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet } from 'react-router-dom';
import useStore from '../store';
import { apiService } from '../services/apiService';

function Layout() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useStore();
  const location = useLocation();
  const isLivePage = location.pathname.includes('/live');
  const [eventName, setEventName] = useState(null);

  useEffect(() => {
    const fetchEventName = async () => {
      if (isLivePage) {
        const eventId = location.pathname.split('/')[2];
        try {
          const response = await apiService.get(`/events/${eventId}/`);
          if (response?.data?.name) {
            setEventName(response.data.name);
          }
        } catch (error) {
          console.error('Error fetching event name:', error);
        }
      } else {
        setEventName(null);
      }
    };

    fetchEventName();
  }, [location.pathname, isLivePage]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            ARES Net Manager
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {eventName && (
              <Typography
                variant={isLivePage ? "h4" : "h6"}
                sx={{
                  fontWeight: isLivePage ? 'bold' : 'normal',
                  textAlign: 'center'
                }}
              >
                {eventName}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/')}
            >
              Events
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/operators')}
            >
              Operators
            </Button>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'hidden',
          ...(isLivePage ? {} : { p: 3 })
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;