
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
    meals: '#3b82f6',
    dairy: '#8b5cf6',
    snacks: '#06b6d4',
    beverages: '#84cc16'
  };
  return colors[category as keyof typeof colors] || '#6b7280';
};

export const createMarkerIcon = (item: any): string => {
  const color = getCategoryColor(item.category);
  
  return `
    <div class="food-marker" style="
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      background-image: url(${item.image});
      background-size: cover;
      background-position: center;
      background-color: ${color};
      position: relative;
      transition: transform 0.2s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: white;
        font-weight: bold;
      ">
        ${item.category === 'vegetables' ? '🥬' : 
          item.category === 'fruits' ? '🍎' : 
          item.category === 'baked' ? '🍞' : 
          item.category === 'desserts' ? '🧁' : 
          item.category === 'meals' ? '🍽️' : 
          item.category === 'dairy' ? '🥛' : 
          item.category === 'snacks' ? '🍿' : 
          item.category === 'beverages' ? '🥤' : '🍴'}
      </div>
    </div>
  `;
};

export const createPopupContent = (item: any): string => {
  const expiryInfo = item.expire_date 
    ? `<div class="text-xs text-orange-600 font-medium mt-2 p-2 bg-orange-50 rounded">⏰ Expires: ${new Date(item.expire_date).toLocaleDateString()}</div>`
    : '';

  return `
    <div class="p-4 max-w-xs">
      <div class="relative mb-3">
        <img src="${item.image}" alt="${item.title}" class="w-full h-32 object-cover rounded-lg" />
        <div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium" style="color: ${getCategoryColor(item.category)}">
          ${item.category}
        </div>
      </div>
      
      <h3 class="font-bold text-lg mb-2 text-gray-800">${item.title}</h3>
      <p class="text-gray-600 text-sm mb-3 leading-relaxed">${item.description}</p>
      
      ${expiryInfo}
      
      <div class="border-t pt-3 mt-3">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span class="flex items-center">
            👤 ${item.user.name}
          </span>
          <span>${item.postedAt}</span>
        </div>
        
        <div class="text-xs text-gray-500 flex items-center">
          📍 ${item.location.address}
        </div>
      </div>
      
      <div class="mt-3 pt-3 border-t">
        <button 
          onclick="window.open('https://www.google.com/maps/dir//${item.location.lat},${item.location.lng}', '_blank')"
          class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🗺️ Get Directions
        </button>
      </div>
    </div>
  `;
};
