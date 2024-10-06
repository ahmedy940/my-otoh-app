import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Facebook App Details
const clientId = process.env.FACEBOOK_CLIENT_ID;
const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

// Facebook OAuth URL
const oauthUrl = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=ads_management`;

const FacebookAuth = () => {
  const location = useLocation();

  // Handle OAuth token exchange after redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (code) {
      // Exchange the code for an access token
      fetch('https://graph.facebook.com/v13.0/oauth/access_token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          client_id: clientId,
          redirect_uri: redirectUri,
          client_secret: clientSecret,
          code: code,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            console.log('Access Token:', data.access_token);
            // Save token securely (local storage or backend)
          }
        })
        .catch((error) => {
          console.error('Error exchanging code for token:', error);
        });
    }
  }, [location]);

  // Redirect user to Facebook login
  const initiateLogin = () => {
    window.location.href = oauthUrl;
  };

  return (
    <div>
      <button onClick={initiateLogin}>Login with Facebook</button>
    </div>
  );
};

export default FacebookAuth;
