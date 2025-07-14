import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAsGuest, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('/backround.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
          zIndex: 0
        }
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(5px)'
        }}
      >
        <Typography variant="h3" sx={{ 
          color: 'white', 
          textAlign: 'center',
          fontWeight: 'normal',
          mb: 2
        }}>
          {isLogin ? 'Login' : 'Create Account'}
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          onClick={loginAsGuest}
          sx={{
            color: '#CCCCFF',
            borderColor: '#CCCCFF',
            borderRadius: '500px',
            py: 1.5,
            '&:hover': {
              borderColor: '#CCCCFF',
              bgcolor: 'rgba(204, 204, 255, 0.2)'
            }
          }}
        >
          CONTINUE AS GUEST
        </Button>

        <Typography sx={{ 
          color: '#A7A7A7', 
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          - or -
        </Typography>

        <TextField
          fullWidth
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 1,
              '& fieldset': { border: 'none' }
            }
          }}
        />

        <TextField
          fullWidth
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 1,
              '& fieldset': { border: 'none' }
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            bgcolor: '#CCCCFF',
            color: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '500px',
            py: 1.5,
            '&:hover': {
              bgcolor: '#DDDDFF'
            }
          }}
        >
          {isLogin ? 'LOGIN' : 'SIGN UP'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography component="span" sx={{ color: '#A7A7A7' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </Typography>
          <Typography
            component="span"
            onClick={() => setIsLogin(!isLogin)}
            sx={{
              color: '#CCCCFF',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 