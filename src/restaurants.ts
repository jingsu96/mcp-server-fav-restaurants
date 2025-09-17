export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  name: string;
  type: string;
  "top-pick": string;
  location: Location;
}

export interface Restaurants {
  [category: string]: Restaurant[];
}

export const RESTAURANTS: Restaurants = {
  Steakhouses: [
    {
      name: "Blacklock City",
      type: "Steakhouse",
      "top-pick": "Smoked Beef Ribs",
      location: {
        lat: 51.51087,
        lng: -0.08413,
      },
    },
  ],
  Italian: [
    {
      name: "Bancone Borough Yards",
      type: "Italian",
      "top-pick": "Spicy pork & nduja ragù, tagliatelle",
      location: {
        lat: 51.5055,
        lng: -0.0922,
      },
    },
  ],
  "Fast Food": [
    {
      name: "Popeyes Louisiana Chicken - Dartford",
      type: "Fast Food",
      "top-pick": "Spicy Chicken Sandwich",
      location: {
        lat: 51.4455,
        lng: 0.218,
      },
    },
  ],
};

export const CATEGORIES = Object.keys(RESTAURANTS);

export function formatRestaurantsAsMarkdown(cuisine: string): string {
  const restaurants = RESTAURANTS[cuisine];
  if (!restaurants) {
    return `No restaurants found for ${cuisine}`;
  }

  let markdown = `# ${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} Restaurants\n\n`;

  for (const restaurant of restaurants) {
    markdown += `## ${restaurant.name}\n`;
    markdown += `**Type:** ${restaurant.type}\n\n`;
    markdown += `**Top Pick:** ${restaurant["top-pick"]}\n\n`;

    markdown += `**Location**: latitude: ${restaurant.location.lat}, longtitude: ${restaurant.location.lng}\n\n`;

    markdown += `\n`;
  }

  return markdown;
}
