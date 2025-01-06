import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const report = await prisma.report.findUnique({
      where: {
        id: params.id
      }
    });

    if (!report) {
      throw error(404, 'Report not found');
    }

    if (report.userId !== locals.user.id) {
      throw error(403, 'Not authorized to view this report');
    }

    return { report };
  } catch (e) {
    console.error('Error loading report:', e);
    throw error(500, 'Could not load report');
  }
};