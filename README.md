README.md — Loja Veloz

#  Loja Veloz — Arquitetura de Microserviços com Kubernetes

Este projeto implementa uma arquitetura completa de microserviços para uma loja fictícia, utilizando:

- Node.js + Express
- RabbitMQ (mensageria)
- PostgreSQL (persistência)
- Kubernetes (orquestração)
- Docker (containerização)
- API Gateway (proxy e roteamento)
- Healthchecks para readiness/liveness

---

##  Estrutura do Projeto
```
loja-veloz/
├── api-gateway/           # Roteamento e entrada do sistema
├── estoque-service/       # Gestão de estoque
├── pagamentos-service/    # Processamento de pagamentos
├── pedidos-service/       # Criação e consulta de pedidos
├── infra/
│    ├── k8s/              # Manifests Kubernetes (Deployments, Services)
│    ├── dockerfiles/      # Dockerfiles dos serviços
│    └── scripts/          # Scripts auxiliares
└─README.md´

```

---

## 🚀 Arquitetura

### Microserviços

Cada serviço possui:

- API REST própria
- Conexão com RabbitMQ
- Conexão com PostgreSQL (quando necessário)
- Healthcheck `/health` para Kubernetes

### Comunicação

- **API Gateway** → encaminha requisições para os serviços internos
- **RabbitMQ** → troca de eventos entre serviços (fanout)
- **PostgreSQL** → persistência de dados de pedidos e estoque

---

##  Docker

Cada serviço possui seu Dockerfile dentro da pasta correspondente.

Para buildar manualmente:

```
docker build -t api-gateway:latest ./api-gateway
docker build -t estoque-service:latest ./estoque-service
docker build -t pagamentos-service:latest ./pagamentos-service
docker build -t pedidos-service:latest ./pedidos-service

```
Kubernetes
Os manifests estão em: 
```
infra/k8s/
```
Para aplicar tudo:
```
kubectl apply -f infra/k8s/ -n loja-veloz
```
Para reiniciar os deployments:

```
kubectl rollout restart deployment <nome> -n loja-veloz
```
Healthcheck
Todos os serviços expõem:

```
GET /health → 200 OK

```
Essencial para readiness/liveness no Kubernetes.

Como subir o ambiente após ligar a máquina
Iniciar Docker

Buildar imagens

bash
./infra/scripts/build-all.sh
Aplicar Kubernetes

bash
kubectl apply -f infra/k8s/ -n loja-veloz
Verificar

bash
kubectl get pods -n loja-veloz