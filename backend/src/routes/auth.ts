import { Router } from 'express';
import { createApiResponse } from '../../../shared/dist/index';

export const authRoutes = Router();

// Discord OAuth2 login - redirects to Discord
authRoutes.get('/discord', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/discord/callback`);
  const scope = encodeURIComponent('identify guilds');

  if (!clientId) {
    return res.status(500).json(createApiResponse(false, undefined, undefined, 'Discord client ID not configured'));
  }

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  res.redirect(discordAuthUrl);
});

// Discord OAuth2 callback - handles the code exchange
authRoutes.get('/discord/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json(createApiResponse(false, undefined, undefined, 'Authorization code missing'));
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/discord/callback`;

    if (!clientId || !clientSecret) {
      return res.status(500).json(createApiResponse(false, undefined, undefined, 'Discord OAuth credentials not configured'));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: any = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json(createApiResponse(false, undefined, undefined, 'Failed to exchange code for token'));
    }

    // Get user information
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData: any = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(400).json(createApiResponse(false, undefined, undefined, 'Failed to fetch user information'));
    }

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const guildsData = await guildsResponse.json();

    // Store user session
    (req.session as any).user = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator || '0',
      avatar: userData.avatar,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      guilds: guildsData,
    };

    // Redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}?auth=success`);

  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.status(500).json(createApiResponse(false, undefined, undefined, 'Internal server error during authentication'));
  }
});

// Get current user
authRoutes.get('/me', (req, res) => {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json(createApiResponse(false, undefined, undefined, 'Not authenticated'));
  }

  res.json(createApiResponse(true, {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    guilds: user.guilds,
  }));
});

// Logout
authRoutes.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json(createApiResponse(false, undefined, undefined, 'Failed to logout'));
    }
    res.json(createApiResponse(true, null, 'Logged out successfully'));
  });
});