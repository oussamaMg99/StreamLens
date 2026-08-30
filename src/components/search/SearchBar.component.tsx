import { useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, InputBase, ListItemButton, ListItemText, Popover, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';

/**
 * Minimal, media-agnostic result shape — callers map their own Movie/TvShow
 * results into this before passing them in, so this component never needs to
 * know about (or fall back between) TMDB's movie vs. tv field names.
 */
export interface SearchResultItem {
  id: number;
  title: string;
  posterPath?: string;
}

interface SearchBarProps {
  placeholder: string;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  error?: boolean;
  results?: SearchResultItem[];
  onSelectResult?: (item: SearchResultItem) => void;
}

/**
 * SearchBar - presentational search input + results popover.
 *
 * Extracted from Navbar.tsx so it can be reused, unmodified, by both the
 * Movies page (backed by useMovies) and the TV Shows page (backed by useTvShows) —
 * each page owns its own data-fetching hook and just passes the results down.
 */
const SearchBar = (props: SearchBarProps) => {
  const { placeholder, onSubmit, loading, error, results, onSelectResult } = props;
  const [value, setValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const containerRef = useRef<HTMLDivElement>(null);

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleSubmit = () => {
    if (loading || !value.trim()) {
      return;
    }
    setAnchorEl(containerRef.current);
    onSubmit?.(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        p: theme => theme.spacing(0.5, 1.5),
        display: 'flex',
        alignItems: 'center',
        width: { xs: '100%', sm: 300, md: 300 },
        backgroundColor: colors.phantomBlack,
        borderColor: colors.primary.main,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: theme => theme.spacing(1),
      }}
    >
      <InputBase
        placeholder={placeholder}
        sx={{ ml: 1, flex: 1 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <IconButton type='button' disabled={loading} aria-label='search' onClick={handleSubmit}>
        {loading ? <CircularProgress size={20} /> : <SearchIcon color='primary' />}
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: containerRef.current?.offsetWidth,
              maxHeight: 450,
              overflowY: 'auto',
              backgroundColor: colors.phantomBlack,
              border: `1px solid ${colors.primary.main}`,
              borderRadius: 2,
            },
          },
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
      >
        {loading && (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Typography color='error'>Failed to load results</Typography>
          </Box>
        )}

        {!loading && !error && results?.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography>No results found</Typography>
          </Box>
        )}

        {!loading &&
          !error &&
          results?.map(item => (
            <Box
              key={item.id}
              sx={{ display: 'flex', flexDirection: 'row', borderBottom: `1px solid ${colors.primary.main}`, cursor: 'pointer' }}
              onClick={() => {
                onSelectResult?.(item);
                handleClose();
              }}
            >
              <img
                width={100}
                height={100}
                style={{ borderRadius: 10, marginBottom: 8 }}
                src={item.posterPath ? `https://image.tmdb.org/t/p/w200${item.posterPath}` : NoPoster}
                alt={item.title}
              />
              <ListItemButton key={item.id}>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </Box>
          ))}
      </Popover>
    </Box>
  );
};

export default SearchBar;
