import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  username?: string;
  className?: string;
  textClassName?: string;
  isAdmin?: boolean;
}

const LEGACY_GENERIC_AVATARS = [
  'images.unsplash.com/photo-1534528741775-53994a69daeb',
  'images.unsplash.com/photo-1535713875002-d1d0cf377fde',
];

export function isLegacyStockAvatar(url?: string): boolean {
  if (!url) return false;
  return LEGACY_GENERIC_AVATARS.some(fragment => url.includes(fragment));
}

function getInitials(name?: string, username?: string): string {
  const source = (name || username || 'U').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  username,
  className = 'w-8 h-8 rounded-lg',
  textClassName = 'text-xs',
  isAdmin = false,
}) => {
  const cleanSrc = src && !isLegacyStockAvatar(src) ? src : '';
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  if (!cleanSrc || hasError) {
    const initials = getInitials(name, username);
    return (
      <div
        className={`${className} flex items-center justify-center font-display font-black text-white select-none shrink-0 ${
          isAdmin
            ? 'bg-gradient-to-br from-[#d92027] to-[#991b1b]'
            : 'bg-gradient-to-br from-rose-600 to-pink-700'
        }`}
        aria-label={name || username || 'Foto Profil'}
      >
        <span className={textClassName}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={name || username || 'Foto Profil'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} object-cover shrink-0 bg-slate-900`}
    />
  );
};
