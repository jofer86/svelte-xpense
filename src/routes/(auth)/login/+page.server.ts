import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect to dashboard if already logged in
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const rememberMe = data.get('remember-me') === 'on';

    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        fields: { email }
      });
    }

    try {
      const result = await auth.login(email, password, rememberMe);

      if (!result.error && result.session) {
        cookies.set('session', result.session.id, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined // 30 days if remember me
        });

        throw redirect(302, '/dashboard');
      }

      return fail(400, {
        error: result.error || 'Invalid email or password',
        fields: { email }
      });
    } catch (error) {
      // Only log and return error if it's not a redirect
      if (!(error instanceof Response && error.status === 302)) {
        console.error('Login error:', error);
        return fail(500, {
          error: 'An error occurred during login',
          fields: { email }
        });
      }
      throw error; // Re-throw redirect
    }
  }
};