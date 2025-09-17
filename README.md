# mcp-server-fav-restaurants

MPC server with my fav restaurants in the UK showcasing use of MCP resources and prompts

Inspired by Inna’s [mcp-server-fav-recipes](https://github.com/ihrpr/mcp-server-fav-recipe).

## How to start

```
pnpm build && pnpm start
```

## Add to the Claude (Desktop)

```json
{
  "mcpServers": {
    "favorite-restaurants": {
      "command": "node",
      "args": [
        "/Users/jinghuangsu/workspace/ai/mcp/mcp-server-fav-restaurants/dist/index.js"
      ]
    }
  }
}
```


After adding above to your MCP Server config, you should see the fav restaurants MCP shows up in your Resource


[!MCP](https://imgs.jinghuangsu.com/images/AI/mcp/fav-restaurants/mcp-1.png)

[!MCP](https://imgs.jinghuangsu.com/images/AI/mcp/fav-restaurants/mcp-2.png)
