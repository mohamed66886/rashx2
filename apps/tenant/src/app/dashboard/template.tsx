// Re-mounts on every navigation inside /dashboard → soft page transition.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="rx-page-in">{children}</div>;
}
