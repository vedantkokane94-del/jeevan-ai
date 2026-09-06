/**
 * Admin routes layout — Ink theme (SRS §8.2)
 * Routes: /admin/users, /admin/roles, /admin/zones, /admin/facilities,
 *         /admin/audit, /admin/settings
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="ink" className="flex flex-1 flex-col min-h-screen">
      {children}
    </div>
  );
}
