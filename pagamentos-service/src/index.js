const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

// HEALTHCHECK
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

let channel;

async function initRabbit() {
  try {
    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    channel = await conn.createChannel();
    await channel.assertExchange("pagamentos", "fanout", { durable: true });
    console.log("RabbitMQ conectado no pagamentos-service");
  } catch (err) {
    console.error("Erro ao conectar RabbitMQ:", err.message);
    setTimeout(initRabbit, 5000);
  }
}

app.post("/pagar", async (req, res) => {
  try {
    const { pedidoId, valor } = req.body;

    const status = Math.random() > 0.2 ? "APROVADO" : "NEGADO";

    channel.publish(
      "pagamentos",
      "",
      Buffer.from(JSON.stringify({ tipo: "PagamentoProcessado", pedidoId, valor, status }))
    );

    res.json({ pedidoId, valor, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao processar pagamento" });
  }
});

const port = process.env.PORT || 3002;

(async () => {
  await initRabbit();
  app.listen(port, () => {
    console.log(`Pagamentos service rodando na porta ${port}`);
  });
})();
