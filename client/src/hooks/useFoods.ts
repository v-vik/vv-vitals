import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Food, FoodsSchema } from '../lib/api';

const fetchFoods = async () => {
  const response = await api.get('/api/foods');
  return FoodsSchema.parse(response.data);
};

export const useFoods = () => {
  return useQuery({ queryKey: ['foods'], queryFn: fetchFoods });
};

export const useCreateFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Food, 'id' | 'created_at'>) => {
      const response = await api.post('/api/foods', payload);
      return Food.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foods']);
    },
  });
};
