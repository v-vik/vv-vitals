import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const fetchDiaryEntry = async (date: string) => {
  const response = await api.get(`/api/diary/${date}`);
  return response.data;
};

export const useDiaryEntry = (date: string) => {
  return useQuery({ queryKey: ['diary', date], queryFn: () => fetchDiaryEntry(date), retry: false });
};
