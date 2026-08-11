const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Endpoint de saúde para Kubernetes
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Proxies
app.use("/pedidos", createProxyMiddleware({
  target: "http://pedidos-service:3001",
  changeOrigin: true
}));

app.use("/pagamentos", createProxyMiddleware({
  target: "http://pagamentos-service:3002",
  changeOrigin: true
}));

app.use("/estoque", createProxyMiddleware({
  target: "http://estoque-service:3003",
  changeOrigin: true
}));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API Gateway rodando na porta ${port}`);
});
