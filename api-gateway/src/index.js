// Importa o framework Express para criar o servidor HTTP
const express = require("express");

// Importa o middleware de proxy para redirecionar requisições
const { createProxyMiddleware } = require("http-proxy-middleware");

// Cria a aplicação Express
const app = express();

// Endpoint de saúde (healthcheck) usado pelo Kubernetes para verificar se o serviço está ativo
app.get("/health", (req, res) => {
  res.status(200).send("OK"); // Retorna status 200 e mensagem simples
});

// Proxy para o serviço de pedidos
// Todas as requisições que chegam em /pedidos são encaminhadas para o serviço interno de pedidos
app.use("/pedidos", createProxyMiddleware({
  target: "http://pedidos-service:3001", // endereço do serviço dentro do cluster
  changeOrigin: true
}));

// Proxy para o serviço de pagamentos
// Encaminha requisições de /pagamentos para o serviço de pagamentos
app.use("/pagamentos", createProxyMiddleware({
  target: "http://pagamentos-service:3002",
  changeOrigin: true
}));

// Proxy para o serviço de estoque
// Encaminha requisições de /estoque para o serviço de estoque
app.use("/estoque", createProxyMiddleware({
  target: "http://estoque-service:3003",
  changeOrigin: true
}));

// Define a porta do servidor (usa variável de ambiente ou padrão 8080)
const port = process.env.PORT || 8080;

// Inicia o servidor e exibe mensagem no console
app.listen(port, () => {
  console.log(`API Gateway rodando na porta ${port}`);
});
//teste*****************************************************
//%%%%%%%%%%%%%%%%%%%%%********