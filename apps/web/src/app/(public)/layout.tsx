/**
 * Public routes layout — Paper theme (SRS §8.2)
 * Routes: /emergency, /public/sos, /public/incident, /public/status
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="paper" className="flex flex-1 flex-col min-h-screen">
      {children}
    </div>
  );
}
