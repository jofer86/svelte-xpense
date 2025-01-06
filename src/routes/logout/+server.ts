import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session');

  if (sessionId) {
    await auth.logout(sessionId);
    cookies.delete('session', { path: '/' });
  }

  throw redirect(302, '/login');
};