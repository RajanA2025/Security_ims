import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Menu,
  TextField,
  Button,
  useTheme,
  Fade,
} from '@mui/material';
import { AccountCircle, AccountCircleOutlined, Login } from '@mui/icons-material';
import { GiRamProfile } from 'react-icons/gi';

const Header = ({ onDateChange }) => {
  const theme = useTheme();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [context, setContext] = useState('Account');
  const [loaded, setLoaded] = useState(false); // trigger animation
  const [anchorEl, setAnchorEl] = useState(null);

  // Open menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    setLoaded(true); // trigger fade-in on mount
  }, []);

  useEffect(() => {
    if (startDate && endDate && context) {
      onDateChange({ startDate, endDate, context });
    }
  }, [startDate, endDate, context]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        bgcolor:'white',
        color: theme.palette.text.primary,
        // borderBottom: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 25 }} />
          <Typography variant="h5"  color='black' fontWeight={600}>
            IMS Security
          </Typography>
        </Box>

        {/* <Fade in={loaded} timeout={600}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              bgcolor: '#F9F7F3 ',
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Select
              size="small"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              sx={{
                minWidth: 150,
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <MenuItem value="Account">By Account</MenuItem>
              <MenuItem value="Environment">By Environment</MenuItem>
              <MenuItem value="Service">By Service</MenuItem>
              <MenuItem value="App">By App</MenuItem>
            </Select>

            <TextField
              size="small"
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: 1,
              }}
            />

            <TextField
              size="small"
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: 1,
              }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.light,
                },
              }}
            >
              Reset
            </Button>

            <IconButton sx={{ ml: 1 }}>
              <AccountCircle fontSize="medium" />
            </IconButton>
          </Box>
        </Fade> */}
         <IconButton onClick={handleMenu}>
              <AccountCircleOutlined fontSize="medium" /> 
            </IconButton>
            <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); alert("Go to Profile"); }}>
         <AccountCircleOutlined/>  &nbsp;  Profile
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); alert("Logout clicked"); }}>
        <Login/> &nbsp;  Logout
        </MenuItem>
      </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
