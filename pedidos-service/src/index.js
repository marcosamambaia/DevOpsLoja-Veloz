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
    await channel.assertExchange("pedidos", "fanout", { durable: true });
    console.log("RabbitMQ conectado no pedidos-service");
  } catch (err) {
    console.error("Erro ao conectar RabbitMQ:", err.message);
    setTimeout(initRabbit, 5000);
  }
}

app.post("/pedidos", async (req, res) => {
  try {
    const { clienteId, itens } = req.body;

    const result = await pool.query(
      "INSERT INTO pedidos (cliente_id, itens) VALUES ($1, $2) RETURNING id",
      [clienteId, JSON.stringify(itens)]
    );

    const pedidoId = result.rows[0].id;

    channel.publish(
      "pedidos",
      "",
      Buffer.from(JSON.stringify({ tipo: "PedidoCriado", pedidoId }))
    );

    res.status(201).json({ id: pedidoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar pedido" });
  }
});

app.get("/pedidos/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pedidos WHERE id = $1", [
      req.params.id
    ]);

    if (!result.rows.length)
      return res.status(404).json({ erro: "Não encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao consultar pedido" });
  }
});

const port = process.env.PORT || 3001;

(async () => {
  await initRabbit();
  app.listen(port, () => {
    console.log(`Pedidos service rodando na porta ${port}`);
  });
})();
