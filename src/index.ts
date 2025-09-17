#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CATEGORIES, formatRestaurantsAsMarkdown } from "./restaurants.js";

const server = new Server(
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

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: CATEGORIES.map((category) => ({
      uri: `file://restaurants/${category}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Restaurants`,
      mimeType: "text/markdown",
      description: `Favorite ${category.toLowerCase()} restaurants with top picks and locations`,
    })),
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const category = uri.replace("file://restaurants/", "");

  if (!CATEGORIES.includes(category)) {
    throw new Error(`Unknown category: ${category}`);
  }

  return {
    contents: [
      {
        uri: uri,
        mimeType: "text/markdown",
        text: formatRestaurantsAsMarkdown(category),
      },
    ],
  };
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "find-my-fav-restaurants",
        description:
          "Find my favorite restaurant from category-specific restaurants",
        arguments: [
          {
            name: "category",
            description: "The restaurant category to search in",
            required: true,
          },
        ],
      },
    ],
  };
});

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "find-my-fav-restaurants") {
    throw new Error(`Unknown prompt: ${name}`);
  }

  if (!args || !args.category) {
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

  const category = args.category;
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

  const resourceUri = `file://restaurants/${category}`;
  const restaurantContent = formatRestaurantsAsMarkdown(category);

  return {
    description: `Find favorite ${category.charAt(0).toUpperCase() + category.slice(1)} restaurants`,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Help me find the best ${category.toLowerCase()} restaurants from my saved list. I've attached my restaurant data below.\n\nPlease provide:\n1. A summary of available ${category.toLowerCase()} restaurants\n2. Top recommendations with their signature dishes\n3. Location information for each restaurant\n4. Any additional insights about these establishments\n\nFocus on the "top-pick" dishes and location details.`,
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
});

const transport = new StdioServerTransport();
server.connect(transport);
