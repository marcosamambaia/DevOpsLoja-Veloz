output "namespace_name" {
  description = "Nome do namespace criado"
  value       = kubernetes_namespace.loja_veloz.metadata[0].name
}
