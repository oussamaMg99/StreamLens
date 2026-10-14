import { Box, ButtonBase } from '@mui/material';
import colors from 'src/assets/themes/colors';

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'small' | 'medium';
}

/** A single-choice row of pills with counts (type and status filters). */
const FilterPills = <T extends string>({ options, value, onChange, ariaLabel, size = 'medium' }: FilterPillsProps<T>) => (
  <Box role='radiogroup' aria-label={ariaLabel} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {options.map(option => {
      const selected = option.value === value;
      return (
        <ButtonBase
          key={option.value}
          role='radio'
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          sx={{
            gap: 1,
            height: size === 'small' ? 36 : 40,
            px: size === 'small' ? 1.75 : 2.25,
            borderRadius: '20px',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: size === 'small' ? 13 : 14,
            color: selected ? colors.onPrimary : 'rgba(255,255,227,0.75)',
            backgroundColor: selected ? colors.primary.main : 'rgba(20,20,20,0.45)',
            border: `1px solid ${selected ? colors.primary.main : 'rgba(255,255,255,0.12)'}`,
            transition: 'background-color .15s ease, border-color .15s ease',
            '&:hover': { borderColor: selected ? colors.primary.main : 'rgba(226,168,71,0.5)' },
            '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
          }}
        >
          {option.label}
          <Box component='span' sx={{ fontSize: 12, opacity: 0.7 }}>
            {option.count}
          </Box>
        </ButtonBase>
      );
    })}
  </Box>
);

export default FilterPills;
