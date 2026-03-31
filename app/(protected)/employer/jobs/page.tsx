import { redirect } from 'next/navigation';

/**
 * /employer/jobs redirect
 *
 * The canonical "Manage Jobs" page lives at /employer.
 * This redirect keeps old bookmarks / links functional.
 */
export default function EmployerJobsRedirectPage() {
  redirect('/employer');
}
