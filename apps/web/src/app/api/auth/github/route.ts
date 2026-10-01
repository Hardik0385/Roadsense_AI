import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23lioLRTlkgbmLnABf';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '2a671418d435d6c6100d4b80fac4af3e02a2a621';

    // 1. Exchange authorization code for GitHub access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error || 'Failed to retrieve GitHub access token' },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RoadSense-AI-Web',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const ghUserData = await userRes.json();

    // 3. If email is private on GitHub profile, query the user/emails endpoint
    let email = ghUserData.email;
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'RoadSense-AI-Web',
            Accept: 'application/vnd.github.v3+json',
          },
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
          if (primaryEmail) email = primaryEmail.email;
        }
      } catch (e) {
        console.warn('Could not fetch user primary email from GitHub', e);
      }
    }

    const name = ghUserData.name || ghUserData.login || 'GitHub Developer';
    const names = name.split(' ');
    const initials = names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

    return NextResponse.json({
      success: true,
      user: {
        id: `usr_gh_${ghUserData.id || Date.now()}`,
        name: name,
        email: email || `${ghUserData.login}@github.user`,
        role: 'Principal Telematics Architect',
        avatarInitials: initials,
        department: 'IoT Edge Stream Engineering',
        provider: 'github',
        token: accessToken,
        avatarUrl: ghUserData.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('GitHub OAuth Exchange Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error exchanging GitHub code' },
      { status: 500 }
    );
  }
}
