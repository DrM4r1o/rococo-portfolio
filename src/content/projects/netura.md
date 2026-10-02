---
title: 'Netura'
description: 'Plataforma de gestión de patrimonio personal y familiar: API en Spring Boot con arquitectura hexagonal y dashboard en Angular.'
year: 2026
role: 'Full-Stack Engineer'
stack: ['Java 21', 'Spring Boot', 'Angular', 'PostgreSQL', 'OAuth2', 'Docker']
featured: true
pubDate: 2026-06-01
---

**Netura** es una plataforma para gestionar el patrimonio personal y familiar: activos,
categorías, transacciones y un dashboard de riqueza, con una arquitectura pensada para
operar en producción a coste cero sin renunciar a la escalabilidad.

## Arquitectura

- **Backend** (`core`): API REST en Java 21 y Spring Boot 3 siguiendo
  **arquitectura hexagonal (puertos y adaptadores)**, con dominio aislado de framework
  e infraestructura.
- **Seguridad**: **OAuth2 / OpenID Connect** con Google y JWT como resource server,
  evitando coste de infraestructura de autenticación.
- **Persistencia**: PostgreSQL sobre Spring Data JPA y validación de DTOs.

## Producto

- Dashboard de patrimonio con categorías y tipos de activo globales.
- SPA en **Angular 21** consumiendo la API.
- Entorno local reproducible con **Docker Compose** (PostgreSQL 16).

Modelo de dominio rico con casos de uso separados de la capa web, priorizando un código
mantenible y testeable.
