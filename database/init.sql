CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(255),
  valor NUMERIC,
  status VARCHAR(50)
);
