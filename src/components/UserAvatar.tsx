"use client";

import React from 'react';
import { getUserAvatarUrl } from '@/lib/avatar';

interface UserAvatarProps {
  user?: any;
  className?: string;
  alt?: string;
}

export function UserAvatar({
  user,
  className = "w-9 h-9 rounded-full object-cover shrink-0 border border-[#D9D9DF]",
  alt = "User Profile Avatar",
}: UserAvatarProps) {
  const avatarSrc = getUserAvatarUrl(user);

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = '/images/user-avatar.webp';
      }}
    />
  );
}
