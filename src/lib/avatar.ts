export function getUserAvatarUrl(user?: {
  role?: string;
  gender?: string;
  app_metadata?: { role?: string };
  user_metadata?: { gender?: string };
} | null): string {
  const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
  const gender = (user?.gender || user?.user_metadata?.gender || '').toUpperCase();

  if (role === 'admin' || role === 'super admin') {
    return '/images/admin-profile.png';
  }

  if (gender === 'FEMALE') {
    return '/images/female-profile.png';
  }

  return '/images/user-avatar.png';
}
