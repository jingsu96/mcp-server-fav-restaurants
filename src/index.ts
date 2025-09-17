#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  CATEGORIES,
  RESTAURANTS,
  formatRestaurantsAsMarkdown,
} from "./restaurants.js";

// Create the MCP server
const server = new McpServer(
  {
    name: "favorite-restaurants",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
    },
  },
);

// Register each restaurant category as a resource
for (const category of CATEGORIES) {
  server.resource(
    `${category.charAt(0).toUpperCase() + category.slice(1)} Restaurants`,
    `restaurants://${category}`,
    {
      description: `Favorite ${category.toLowerCase()} restaurants with top picks and locations`,
      mimeType: "text/markdown",
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "text/markdown",
            text: formatRestaurantsAsMarkdown(category),
          },
        ],
      };
    },
  );
}

const schema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      "The restaurant category to search in (Steakhouses, Italian, Fast Food)",
    ),
});

const funccc = async ({
  category,
}: {
  category?: string;
}): Promise<GetPromptResult> => {
  if (!category) {
    const available = CATEGORIES.join(", ");
    return {
      description: "Find my favorite restaurants by category",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please specify a restaurant category from the following options: ${available}`,
          },
        },
      ],
    };
  }

  if (!CATEGORIES.includes(category)) {
    const available = CATEGORIES.join(", ");
    return {
      description: "Find my favorite restaurants by category",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Sorry, I don't have restaurants for '${category}'. Available categories: ${available}`,
          },
        },
      ],
    };
  }

  const resourceUri = `restaurants://${category}`;
  const restaurantContent = formatRestaurantsAsMarkdown(category);
  const restaurantCount = RESTAURANTS[category]?.length || 0;

  return {
    description: `Find favorite ${category.charAt(0).toUpperCase() + category.slice(1)} restaurants`,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Help me find the best ${category.toLowerCase()} restaurants from my saved list. I have ${restaurantCount} ${category.toLowerCase()} restaurant(s) saved.

Please provide:
1. A summary of my ${category.toLowerCase()} restaurants
2. Top recommendations with signature dishes
3. Location details for planning visits
4. Why each restaurant is special

Focus on the "top-pick" dishes and precise coordinates for navigation.`,
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: resourceUri,
            mimeType: "text/markdown",
            text: restaurantContent,
          },
        },
      },
    ],
  };
};

// Register the restaurant finder prompt using the direct prompt() method
server.prompt(
  "find-my-fav-restaurants",
  "Find my favorite restaurant from category-specific restaurants",
  schema.shape,
  funccc,
);

// Connect to stdio transport and start the server
const transport = new StdioServerTransport();
server.connect(transport);
