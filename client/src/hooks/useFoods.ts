import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoods, createFood, deleteFood, CreateFood } from '../lib/api';

export const useFoods = () => {
  return useQuery({ queryKey: ['foods'], queryFn: getFoods });
};

export const useCreateFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFood) => createFood(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};

export const useDeleteFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
};
