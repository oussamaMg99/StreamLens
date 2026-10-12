import { KeyboardEvent } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { MediaType } from 'src/types/global.type';

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

/** Movies / TV segmented switch used by the genre podium (mobile) and each suggestion row. */
const MediaTypeToggle = (props: MediaTypeToggleProps) => {
  const { value, onChange, size = 'medium', fullWidth } = props;
  const { t } = useTranslation();
  const small = size === 'small';
  const options = [
    { value: MediaType.Movie, label: t('movies') },
    { value: MediaType.TVShow, label: small ? t('tv') : t('tvShows') },
  ];

  // Radio-group keyboard pattern: only the checked option is tabbable, and any arrow key
  // moves to the other one (two options, so direction and RTL don't matter).
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = options.find(option => option.value !== value);
    if (!next) return;
    onChange(next.value);
    const sibling = (event.currentTarget.nextElementSibling ?? event.currentTarget.previousElementSibling) as HTMLElement | null;
    sibling?.focus();
  };

  return (
    <Box
      role='radiogroup'
      aria-label={t('mediaTypeLabel')}
      sx={{
        display: 'flex',
        gap: small ? 0.25 : 0.5,
        p: small ? 0.375 : 0.5,
        width: fullWidth ? '100%' : 'auto',
        borderRadius: small ? '8px' : '10px',
        backgroundColor: colors.phantomBlack,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Box
            key={option.value}
            component='button'
            type='button'
            role='radio'
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            sx={{
              flex: fullWidth ? 1 : 'none',
              // Full-width (mobile) variant keeps a 44px tap target.
              minHeight: fullWidth ? 44 : 'auto',
              px: small ? 1.5 : 2.25,
              py: small ? 0.625 : 1,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: small ? 12 : 14,
              borderRadius: small ? '6px' : '8px',
              color: selected ? colors.onPrimary : 'rgba(255,255,227,0.7)',
              backgroundColor: selected ? colors.primary.main : 'transparent',
              transition: 'background-color .15s ease, color .15s ease',
              '&:hover': { color: selected ? colors.onPrimary : colors.primary.main },
              '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
            }}
          >
            {option.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default MediaTypeToggle;
