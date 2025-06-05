
interface FoodItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  user_id: string;
  created_at: string;
  expire_date: string | null;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export const convertToFoodCardFormat = (item: FoodItem) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  image: item.image_url || '/placeholder.svg',
  category: item.category,
  location: {
    lat: item.location_lat,
    lng: item.location_lng,
    address: item.location_address
  },
  user: {
    name: item.user.full_name,
    avatar: item.user.avatar_url || '/placeholder.svg'
  },
  user_id: item.user_id,
  postedAt: new Date(item.created_at).toLocaleDateString(),
  expireDate: item.expire_date,
  likes: 0,
  isLiked: false
});
