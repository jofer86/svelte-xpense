/// <reference types="lucia" />
import type { PrismaClient } from '@prisma/client';
import type { User } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface Platform {}
		// interface PrivateEnv {}
		// interface PublicEnv {}
	}
}

// Used in prisma singleton pattern
declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

export {};
