import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const user = await auth.validateSession(sessionId);
    if (user) {
      event.locals.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } else {
      // Invalid or expired session, remove the cookie
      event.cookies.delete('session', { path: '/' });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};

export const handle = sequence(handleAuth);