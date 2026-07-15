import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  InputBase,
  Drawer,
  useTheme,
  useMediaQuery,
  CircularProgress,
  ListItemButton,
  ListItemText,
  Popover,
} from '@mui/material';
import colors from 'src/assets/themes/colors';
import { navbarHeight } from 'src/utils/constants';
import { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
// import MovieIcon from '@mui/icons-material/Movie';
// import LiveTvIcon from '@mui/icons-material/LiveTv';
// import InfoIcon from '@mui/icons-material/Info';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import i18n from 'src/assets/locales/i18n';
import { searchService } from 'src/core/services/search.service';
import { useSearchAll } from 'src/core/hooks/useSearchAll';
import NoPoster from 'src/assets/images/no-movie.png';

interface NavbarProps {
  // You can add props here if needed
  onSearchResultItemClick?: (item: any) => void; // Define a type for the search result item if possible
}

const Navbar = (props: NavbarProps) => {
  const { onSearchResultItemClick } = props;
  const [openMenu, setOpenMenu] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('star wars');
  const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLElement | null>(null);
  const searchOpen = Boolean(searchAnchorEl);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { data: searchResults, isLoading: searchLoading, error, refetch } = useSearchAll(searchTerm);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (code: string) => {
    // Implement language change logic here
    i18n.changeLanguage(code);
    setAnchorEl(null);
  };

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setSearchAnchorEl(searchContainerRef.current);

    await refetch();
  };

  const handleCloseSearch = () => {
    setSearchAnchorEl(null);
  };

  useEffect(() => {
    if (isMdUp && openMenu) setOpenMenu(false);
  }, [isMdUp]);
  return (
    <>
      <AppBar
        position='fixed'
        elevation={3}
        sx={{
          top: theme => theme.spacing(1),
          width: theme => `calc(100% - ${theme.spacing(2)})`,
          marginX: theme => theme.spacing(1),
          borderRadius: theme => theme.spacing(1),
          zIndex: theme => theme.zIndex.appBar + 10,
          backgroundColor: colors.phantomBlack,
          backdropFilter: theme => `blur(${theme.spacing(2)})`,
        }}
      >
        <Toolbar sx={{ height: navbarHeight }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row', md: 'row' },
              alignItems: 'center',
              justifyContent: { xs: 'space-around', sm: 'center', md: 'space-between' },
              width: '100%',
            }}
          >
            {/* Logo placeholder */}
            <Typography variant='h4' sx={{ cursor: 'pointer', display: { xs: 'none', sm: 'none', md: 'block' } }}>
              {t('appName')}
            </Typography>
            {/* nav links (hide on small screens if desired) */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'none', md: 'flex' },
                flexDirection: 'row',
                gap: 2,
              }}
            >
              <Button variant='text'>{t('movies')}</Button>
              <Button variant='text'>{t('tvShows')}</Button>
              <Button variant='text'>{t('about')}</Button>
            </Box>
            {/* Search Bar */}
            <Box
              sx={{
                display: 'flex',
              }}
            >
              <Box
                ref={searchContainerRef}
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
                <IconButton
                  aria-label='nav-menu'
                  aria-expanded={openMenu}
                  aria-controls={openMenu ? 'mobile-nav' : undefined}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                  onClick={() => setOpenMenu(prev => !prev)}
                >
                  <MenuIcon color='primary' />
                </IconButton>

                <InputBase
                  placeholder={t('searchStreamLens')}
                  sx={{ ml: 1, flex: 1 }}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSearch(e as any);
                    }
                  }}
                />
                <IconButton type='button' disabled={searchLoading} aria-label='search' onClick={handleSearch}>
                  {searchLoading ? <CircularProgress size={20} /> : <SearchIcon color='primary' />}
                </IconButton>
                <Popover
                  open={searchOpen}
                  anchorEl={searchAnchorEl}
                  onClose={handleCloseSearch}
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
                        width: searchContainerRef.current?.offsetWidth,
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
                      handleCloseSearch();
                    }
                  }}
                >
                  {searchLoading && (
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

                  {!searchLoading && error && (
                    <Box sx={{ p: 2 }}>
                      <Typography color='error'>Failed to load results</Typography>
                    </Box>
                  )}

                  {!searchLoading && !error && searchResults?.results.length === 0 && (
                    <Box sx={{ p: 2 }}>
                      <Typography>No results found</Typography>
                    </Box>
                  )}

                  {!searchLoading &&
                    !error &&
                    searchResults &&
                    searchResults?.results.map(item => (
                      <Box
                        key={item.id}
                        sx={{ display: 'flex', flexDirection: 'row', borderBottom: `1px solid ${colors.primary.main}`, cursor: 'pointer' }}
                        onClick={() => {
                          onSearchResultItemClick && ['tv', 'movie'].includes(item?.media_type) && onSearchResultItemClick?.(item);
                          handleCloseSearch();
                        }}
                      >
                        <img
                          width={100}
                          height={100}
                          style={{ borderRadius: 10, marginBottom: 8 }}
                          src={item?.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : NoPoster}
                          alt={item?.name ?? item?.title ?? 'Untitled'}
                        />
                        <ListItemButton key={item.id}>
                          <ListItemText primary={item.title ?? item.name ?? 'Unknown'} />
                        </ListItemButton>
                      </Box>
                    ))}
                </Popover>
              </Box>
              {/* Language Selector */}
              <IconButton type='button' aria-label='language' onClick={handleClick}>
                <LanguageIcon color='primary' />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: colors.phantomBlack,
                      backdropFilter: theme => `blur(${theme.spacing(2)})`,
                      mt: 1,
                    },
                  },
                }}
              >
                {languageOptions.map(option => (
                  <MenuItem
                    key={option.code}
                    selected={i18n.language === option.code}
                    onClick={() => handleLanguageChange(option.code)}
                    sx={{
                      color: colors.text.primary,
                      '&.Mui-selected': {
                        color: colors.primary.main,
                        backgroundColor: 'rgba(226, 168, 71, 0.15)',
                      },
                      '&:hover': {
                        color: colors.primary.main,
                        backgroundColor: 'rgba(226, 168, 71, 0.1)',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'rgba(226, 168, 71, 0.2)',
                      },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor='top'
        open={openMenu}
        onClose={() => setOpenMenu(prev => !prev)}
        slotProps={{ paper: { sx: { backgroundColor: colors.phantomBlack } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2, gap: 1 }}>
          <Button fullWidth onClick={() => setOpenMenu(prev => !prev)}>
            {'Movies'}
          </Button>
          <Button fullWidth onClick={() => setOpenMenu(prev => !prev)}>
            {'TV Shows'}
          </Button>
          <Button fullWidth onClick={() => setOpenMenu(prev => !prev)}>
            {'About'}
          </Button>
          {/* <IconButton type='button' aria-label='search'>
            <MovieIcon color='primary' />
          </IconButton>
          <IconButton type='button' aria-label='search'>
            <LiveTvIcon color='primary' />
          </IconButton>
          <IconButton type='button' aria-label='search'>
            <InfoIcon color='primary' />
          </IconButton> */}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
