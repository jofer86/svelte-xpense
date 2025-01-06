import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const auth = {
  async login(email: string, password: string, rememberMe: boolean) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) {
      return { error: 'Invalid email or password' };
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000) // 30 days or 1 day
      }
    });

    return { session, user };
  },

  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'USER'
      }
    });

    return { user };
  },

  async validateSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: { id: sessionId }
      });
      return null;
    }

    return session.user;
  },

  async logout(sessionId: string) {
    await prisma.session.delete({
      where: { id: sessionId }
    });
  }
};