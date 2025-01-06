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
  register: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirm-password')?.toString();

    if (!email || !password || !confirmPassword) {
      return fail(400, {
        error: 'All fields are required',
        fields: { email }
      });
    }

    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Passwords do not match',
        fields: { email }
      });
    }

    if (password.length < 8) {
      return fail(400, {
        error: 'Password must be at least 8 characters long',
        fields: { email }
      });
    }

    try {
      const result = await auth.register(email, password);

      if (result.error) {
        return fail(400, {
          error: result.error,
          fields: { email }
        });
      }

      // Log the user in after registration
      const loginResult = await auth.login(email, password, false);

      if (loginResult.session) {
        cookies.set('session', loginResult.session.id, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 // 1 day
        });

        throw redirect(302, '/dashboard');
      }

      return fail(500, {
        error: 'Failed to log in after registration',
        fields: { email }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return fail(500, {
        error: 'An error occurred during registration',
        fields: { email }
      });
    }
  }
};