import { MouseEvent, useState } from 'react';
import { Box, ButtonBase, Divider, IconButton, InputBase, ListSubheader, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { BoardFilters, BoardSort } from 'src/core/models/watchListBoard.model';
import { SORTS } from 'src/utils/watchListBoard.utils';
import { fieldSx } from './watchList.styles';

const SORT_LABEL_KEY: Record<BoardSort, string> = {
  saved: 'sortSaved',
  title: 'sortTitle',
  year: 'sortYear',
  progress: 'sortProgress',
};

interface WatchListToolbarProps {
  filters: BoardFilters;
  genres: string[];
  onChange: (change: Partial<BoardFilters>) => void;
  /** Mobile: search + one icon button that holds sort and genre. */
  compact?: boolean;
}

const menuPaperSx = {
  mt: 0.75,
  minWidth: 200,
  maxHeight: 320,
  backgroundColor: '#1A1410',
  color: colors.text.primary,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
};
const subheaderSx = {
  backgroundColor: '#1A1410',
  color: 'rgba(255,255,227,0.5)',
  fontSize: 12,
  lineHeight: '32px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

/** Search, genre and sort. Filtering happens on the already-loaded list, not TMDB. */
const WatchListToolbar = ({ filters, genres, onChange, compact }: WatchListToolbarProps) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ anchor: HTMLElement; kind: 'genre' | 'sort' | 'both' } | null>(null);
  const open = (kind: 'genre' | 'sort' | 'both') => (event: MouseEvent<HTMLElement>) => setMenu({ anchor: event.currentTarget, kind });
  const close = () => setMenu(null);
  const pick = (change: Partial<BoardFilters>) => {
    onChange(change);
    close();
  };
  const genreActive = !!filters.genre;
  const showGenre = menu?.kind === 'genre' || menu?.kind === 'both';
  const showSort = menu?.kind === 'sort' || menu?.kind === 'both';

  const menuButtonSx = (active = false) => ({
    ...fieldSx,
    gap: 0.5,
    px: 1.75,
    fontFamily: 'inherit',
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    color: active ? colors.primary.main : 'rgba(255,255,227,0.75)',
    borderColor: active ? colors.primary.main : 'rgba(255,255,255,0.12)',
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          ...fieldSx,
          flex: 1,
          maxWidth: compact ? 'none' : 420,
          height: compact ? 44 : 42,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.75,
        }}
      >
        <SearchIcon sx={{ fontSize: 20, color: 'rgba(255,255,227,0.55)' }} />
        <InputBase
          value={filters.query}
          onChange={event => onChange({ query: event.target.value })}
          placeholder={t('searchPlaceholder')}
          inputProps={{ 'aria-label': t('searchPlaceholder') }}
          sx={{ flex: 1, fontSize: 14, color: colors.text.primary }}
        />
      </Box>

      {compact ? (
        <IconButton
          aria-label={t('sortAndGenre')}
          onClick={open('both')}
          sx={{ ...fieldSx, width: 44, height: 44, color: genreActive ? colors.primary.main : colors.text.primary }}
        >
          <FilterListIcon />
        </IconButton>
      ) : (
        <>
          <ButtonBase onClick={open('genre')} sx={menuButtonSx(genreActive)}>
            {filters.genre ?? t('allGenres')}
            <ArrowDropDownIcon sx={{ fontSize: 20 }} />
          </ButtonBase>
          <ButtonBase onClick={open('sort')} sx={{ ...menuButtonSx(), ml: 'auto' }}>
            {t('sortLabel', { sort: t(SORT_LABEL_KEY[filters.sort]) })}
            <ArrowDropDownIcon sx={{ fontSize: 20 }} />
          </ButtonBase>
        </>
      )}

      <Menu
        anchorEl={menu?.anchor}
        open={!!menu}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: menu?.kind === 'genre' ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: menu?.kind === 'genre' ? 'left' : 'right' }}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        {showSort && compact && <ListSubheader sx={subheaderSx}>{t('sort')}</ListSubheader>}
        {showSort &&
          SORTS.map(sort => (
            <MenuItem
              key={sort}
              selected={filters.sort === sort}
              onClick={() => pick({ sort })}
              sx={{ fontSize: 14, color: filters.sort === sort ? colors.primary.main : undefined }}
            >
              {t(SORT_LABEL_KEY[sort])}
            </MenuItem>
          ))}
        {showSort && showGenre && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
        {showGenre && compact && <ListSubheader sx={subheaderSx}>{t('genre')}</ListSubheader>}
        {showGenre && (
          <MenuItem
            selected={!filters.genre}
            onClick={() => pick({ genre: null })}
            sx={{ fontSize: 14, color: !filters.genre ? colors.primary.main : undefined }}
          >
            {t('allGenres')}
          </MenuItem>
        )}
        {showGenre &&
          genres.map(genre => (
            <MenuItem
              key={genre}
              selected={filters.genre === genre}
              onClick={() => pick({ genre })}
              sx={{ fontSize: 14, color: filters.genre === genre ? colors.primary.main : undefined }}
            >
              {genre}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default WatchListToolbar;
