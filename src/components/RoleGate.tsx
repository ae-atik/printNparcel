import { ReactNode, useEffect, useState } from 'react';
import { me, Me, Role } from '../lib/auth';

type Props = {
  allow: Role[]; // roles allowed to view
  children: ReactNode;
  fallback?: ReactNode;
};

export default function RoleGate({ allow, children, fallback }: Props) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!user) return fallback ?? <div>Unauthorized</div>;
  if (!allow.includes(user.role)) return <div>Forbidden</div>;
  return <>{children}</>;
}
