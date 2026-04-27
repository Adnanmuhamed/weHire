'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Role, ApplicationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== Role.EMPLOYER) {
      return { error: 'Unauthorized: Employer access required' };
    }

    // Security constraints: Only the employer who explicitly owns the job should change status
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    if (!application) {
      return { error: 'Application not found' };
    }

    if (application.job.company.ownerId !== user.id) {
      return { error: 'Unauthorized: You do not own this application' };
    }

    await db.application.update({
      where: { id: applicationId },
      data: { status: newStatus }
    });

    // Revalidate the applicant board so it visually refreshes status mutations instantly
    revalidatePath(`/employer/jobs/${application.jobId}/applications`);

    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { error: 'Failed to update Application Status' };
  }
}
