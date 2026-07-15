import { useQuery } from '@tanstack/react-query';
import { SearchAllResponse, searchService } from '../services/search.service';

export function useSearchAll(searchTerm: string) {
  return useQuery<SearchAllResponse>({
    queryKey: ['search-all', searchTerm],
    queryFn: (): Promise<SearchAllResponse> => searchService.searchAll({ query: searchTerm }),
    staleTime: 1000 * 60 * 5,
    enabled: false,
  });
}
