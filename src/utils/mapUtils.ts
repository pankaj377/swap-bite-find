
import L from 'leaflet';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    vegetables: '#10b981',
    fruits: '#f97316',
    baked: '#eab308',
    desserts: '#ec4899',
    meals: '#3b82f6'
  };
  return colors[category as keyof typeof colors] || '#6b7280';
};

export const createCustomIcon = (item: any): L.DivIcon => {
  const iconHtml = `
    <div class="food-marker" style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      background-image: url(${item.image});
      background-size: cover;
      background-position: center;
      background-color: ${getCategoryColor(item.category)};
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-food-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export const createPopupContent = (item: any): string => {
  const expiryInfo = item.expire_date 
    ? `<div class="text-xs text-orange-600 mt-1">Expires: ${new Date(item.expire_date).toLocaleDateString()}</div>`
    : '';

  return `
    <div class="p-3 max-w-xs">
      <img src="${item.image}" alt="${item.title}" class="w-full h-32 object-cover rounded-lg mb-2" />
      <h3 class="font-semibold text-lg mb-1">${item.title}</h3>
      <p class="text-gray-600 text-sm mb-2">${item.description}</p>
      ${expiryInfo}
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-gray-500">${item.location.address}</span>
        <span class="text-xs text-gray-500">${item.postedAt}</span>
      </div>
    </div>
  `;
};
