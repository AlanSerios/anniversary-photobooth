import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function run() {
  console.log("Connecting to Canva MCP Server...");
  const transport = new SSEClientTransport(new URL("https://mcp.canva.com/mcp"));
  const client = new Client({ name: "antigravity-client", version: "1.0.0" }, { capabilities: {} });
  
  try {
    await client.connect(transport);
    console.log("Connected successfully!");
    
    console.log("Fetching tools...");
    const tools = await client.listTools();
    console.log("Tools available:", JSON.stringify(tools, null, 2));
    
    console.log("Fetching resources...");
    const resources = await client.listResources();
    console.log("Resources available:", JSON.stringify(resources, null, 2));
    
  } catch (error) {
    console.error("Failed to connect or fetch data:", error);
  } finally {
    process.exit(0);
  }
}

run();
