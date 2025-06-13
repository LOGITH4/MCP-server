const args = process.argv.slice(2);
const transportArg = args.find((arg) => arg.startsWith("--transport="));
const transportArgVal = transportArg?.split("=")[1];

(async () => {
  if (transportArg && transportArgVal === "sse") {
    await import("./transports/sse.ts");
    process.env.MCP_TRANSPORT = "SSE";
  } else {
    await import("./transports/stdio.ts");
    process.env.MCP_TRANSPORT = "STDIO";
  }
})();
