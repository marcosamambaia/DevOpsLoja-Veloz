const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

// HEALTHCHECK
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// POSTGRES
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// RABBITMQ
let channel;

async function initRabbit() {
  try {
    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    channel = await conn.createChannel();
    await channel.assertExchange("estoque", "fanout", { durable: true });
    console.log("RabbitMQ conectado no estoque-service");
  } catch (err) {
    console.error("Erro ao conectar RabbitMQ:", err.message);
    setTimeout(initRabbit, 5000);
  }
}

app.post("/reservar", async (req, res) => {
  try {
    const { produtoId, quantidade } = req.body;

    await pool.query(
      "UPDATE produtos SET reservado = reservado + $1 WHERE id = $2",
      [quantidade, produtoId]
    );

    channel.publish(
      "estoque",
      "",
      Buffer.from(JSON.stringify({ tipo: "EstoqueReservado", produtoId, quantidade }))
    );

    res.json({ produtoId, quantidade, status: "Reservado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao reservar estoque" });
  }
});

app.post("/baixar", async (req, res) => {
  try {
    const { produtoId, quantidade } = req.body;

    await pool.query(
      "UPDATE produtos SET estoque = estoque - $1 WHERE id = $2",
      [quantidade, produtoId]
    );

    channel.publish(
      "estoque",
      "",
      Buffer.from(JSON.stringify({ tipo: "BaixaRealizada", produtoId, quantidade }))
    );

    res.json({ produtoId, quantidade, status: "Baixa realizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao baixar estoque" });
  }
});

const port = process.env.PORT || 3003;

(async () => {
  await initRabbit();
  app.listen(port, () => {
    console.log(`Estoque service rodando na porta ${port}`);
  });
})();
