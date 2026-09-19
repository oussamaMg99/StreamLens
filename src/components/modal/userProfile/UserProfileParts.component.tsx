import { ReactNode } from 'react';
import { Box, Chip, IconButton, InputBase, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import colors from 'src/assets/themes/colors';

export const panelSx = {
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  backgroundColor: 'rgba(20,20,20,0.45)',
};

/* ------------------------------------------------------------------ avatar */

/** "Sofia Marchetti" → "SM"; falls back to the email's first two characters. */
export const getInitials = (displayName?: string | null, email?: string | null) => {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length) return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  return (email ?? '?').slice(0, 2).toUpperCase();
};

interface ProfileAvatarProps {
  photoURL?: string | null;
  initials: string;
  size?: number;
  /** Renders the camera badge; only passed in edit mode. */
  onChangePhoto?: () => void;
}

export const ProfileAvatar = (props: ProfileAvatarProps) => {
  const { photoURL, initials, size = 84, onChangePhoto } = props;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontWeight: 700,
          fontSize: size * 0.36,
          color: colors.onPrimary,
          backgroundColor: colors.primary.main,
          boxShadow: '0 0 0 3px rgba(226,168,71,0.25)',
        }}
      >
        {photoURL ? <Box component='img' src={photoURL} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </Box>
      {!!onChangePhoto && (
        <IconButton
          size='small'
          aria-label='Change photo'
          onClick={onChangePhoto}
          sx={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 30,
            height: 30,
            color: colors.primary.main,
            backgroundColor: '#1A1410',
            border: '1px solid rgba(226,168,71,0.6)',
            '&:hover': { backgroundColor: 'rgba(226,168,71,0.16)' },
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );
};

/* ------------------------------------------------------------ verification */

interface VerifiedChipProps {
  verified: boolean;
  /** Resend action, appended inside the chip when unverified. */
  action?: ReactNode;
}

export const VerifiedChip = (props: VerifiedChipProps) => {
  const { verified, action } = props;
  const tone = verified ? colors.success.main : colors.primary.main;

  return (
    <Chip
      size='small'
      variant='outlined'
      icon={
        verified ? (
          <VerifiedIcon sx={{ fontSize: 14, color: `${tone} !important` }} />
        ) : (
          <ErrorOutlinedIcon sx={{ fontSize: 14, color: `${tone} !important` }} />
        )
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{verified ? 'Email verified' : 'Email not verified'}</span>
          {action}
        </Box>
      }
      sx={{
        height: 'auto',
        py: 0.5,
        borderRadius: 20,
        fontWeight: 600,
        color: tone,
        borderColor: verified ? 'rgba(46,191,165,0.5)' : 'rgba(226,168,71,0.5)',
        backgroundColor: verified ? 'rgba(46,191,165,0.16)' : 'rgba(226,168,71,0.14)',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

/* ---------------------------------------------------------------- data row */

interface ProfileRowProps {
  icon: ReactNode;
  label: string;
  /** Read-mode value; ignored when `input` is supplied. */
  value?: ReactNode;
  /** Edit-mode control. */
  input?: ReactNode;
  divider?: boolean;
}

export const ProfileRow = (props: ProfileRowProps) => {
  const { icon, label, value, input, divider } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.75,
        minHeight: 44,
        py: 1.5,
        borderTop: divider ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,227,0.6)', flex: 'none' }}>
        {icon}
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>{label}</Typography>
      </Box>
      {input ?? (
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.text.primary, textAlign: 'right', minWidth: 0 }}>{value}</Typography>
      )}
    </Box>
  );
};

/** Right-aligned inline input used inside ProfileRow in edit mode. */
export const InlineInput = (props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  width?: number;
}) => {
  const { value, onChange, placeholder, type = 'text', width = 210 } = props;

  return (
    <InputBase
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      sx={{
        width,
        minHeight: 40,
        px: 1.5,
        fontSize: 15,
        borderRadius: '8px',
        color: colors.text.primary,
        backgroundColor: colors.phantomBlack,
        border: '1px solid rgba(226,168,71,0.5)',
        '& input': { textAlign: 'right' },
        '& input::placeholder': { color: 'rgba(255,255,227,0.35)', opacity: 1 },
        '&:focus-within': { borderColor: colors.primary.main, boxShadow: '0 0 0 2px rgba(226,168,71,0.25)' },
      }}
    />
  );
};

/* ----------------------------------------------------------- stat + chips */

export const StatCard = (props: { label: string; value: string; title?: string }) => (
  <Box sx={{ ...panelSx, p: 1.75 }}>
    <Typography
      variant='caption'
      sx={{ display: 'block', mb: 0.75, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,227,0.5)' }}
    >
      {props.label}
    </Typography>
    <Typography title={props.title} sx={{ fontSize: 16, fontWeight: 700, color: colors.text.primary }}>
      {props.value}
    </Typography>
  </Box>
);

const PROVIDER_META: Record<string, { label: string; icon: ReactNode }> = {
  'google.com': { label: 'Google', icon: <GoogleIcon sx={{ fontSize: 14 }} /> },
  'apple.com': { label: 'Apple', icon: <AppleIcon sx={{ fontSize: 14 }} /> },
  'facebook.com': { label: 'Facebook', icon: <FacebookIcon sx={{ fontSize: 14 }} /> },
  password: { label: 'Email', icon: <MailOutlinedIcon sx={{ fontSize: 14 }} /> },
};

/**
 * Read-only by design: unlinking a sole provider would lock the account out, so the
 * chips report state and offer no action.
 */
export const ProviderChips = (props: { providerIds: string[] }) => (
  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
    {props.providerIds.map(id => {
      const meta = PROVIDER_META[id] ?? { label: id, icon: null };
      return (
        <Chip
          key={id}
          size='small'
          variant='outlined'
          icon={meta.icon ? <Box sx={{ display: 'flex', color: `${colors.text.primary} !important`, ml: 1 }}>{meta.icon}</Box> : undefined}
          label={meta.label}
          sx={{
            borderRadius: 20,
            fontWeight: 500,
            color: 'rgba(255,255,227,0.8)',
            borderColor: 'rgba(255,255,255,0.14)',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
      );
    })}
  </Box>
);

/* -------------------------------------------------------------- timestamps */

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000000],
  ['month', 2592000000],
  ['week', 604800000],
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
];

/**
 * Firebase metadata timestamps are UTC strings. Relative text is what the design shows;
 * the absolute value goes in the title attribute so it stays recoverable on hover.
 */
export const formatRelative = (timestamp?: string, locale = 'en') => {
  if (!timestamp) return { relative: '—', absolute: '' };
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return { relative: '—', absolute: '' };

  const diff = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const unit = UNITS.find(([, ms]) => Math.abs(diff) >= ms) ?? (['minute', 60000] as [Intl.RelativeTimeFormatUnit, number]);

  return {
    relative: formatter.format(Math.round(diff / unit[1]), unit[0]),
    absolute: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date),
  };
};
