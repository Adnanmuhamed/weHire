/**
 * Protected Routes Layout
 * 
 * Simple layout wrapper for protected routes.
 * No redirects, no auth checks - middleware handles all authentication.
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

