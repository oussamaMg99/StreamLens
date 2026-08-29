import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import { TvShow } from 'src/core/services/tv.service';

const TVShows = () => {
  const { t } = useTranslation();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TvShow | null>(null);
  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar />
    </>
  );
};

export default TVShows;
