/**
 * Responder routes layout — Paper theme (SRS §8.2)
 * Routes: /responder/dashboard, /responder/incidents, /responder/map, /responder/profile
 */
export default function ResponderLayout({
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
