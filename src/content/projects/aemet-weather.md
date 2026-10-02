---
title: 'AEMET Weather'
description: 'Aplicación full-stack para consultar la previsión del día siguiente en municipios de España: API Spring Boot con arquitectura hexagonal y SPA en Angular con caché y autocompletado.'
year: 2026
role: 'Desarrollo Full-Stack'
stack: ['Java 21', 'Spring Boot', 'Arquitectura Hexagonal', 'H2', 'Angular', 'Docker']
links:
  - label: 'Backend · aemet-core'
    href: 'https://github.com/DrM4r1o/aemet-core'
  - label: 'Frontend · aemet-spa'
    href: 'https://github.com/DrM4r1o/aemet-spa'
featured: true
pubDate: 2026-08-01
---

**AEMET Weather** es una aplicación de punta a punta que consume la API
[AEMET OpenData](https://opendata.aemet.es/centrodedescargas/inicio) para mostrar la
previsión del día siguiente de cualquier municipio español, tanto el backend como el
frontend.

## Reto

Integrar una API pública con clave, normalizar respuestas heterogéneas y ofrecer una
experiencia de búsqueda fluida. El gran obstáculo son los **rate limits de AEMET**, muy
bajos, por lo que había que reducir al mínimo las llamadas al proveedor sin sacrificar
frescura ni tiempos de carga.

## Arquitectura (backend)

- **Arquitectura hexagonal (puertos y adaptadores)**: el dominio y los casos de uso viven
  aislados del framework y de la infraestructura.
- **Aislamiento del consumo de AEMET**: el acceso al proveedor queda detrás de un puerto
  de salida, de modo que cambiar de proveedor no arrastra al resto de la aplicación.
  La capa de adaptadores traduce las respuestas externas a un **modelo de datos propio**,
  evitando acoplamientos futuros.
- **Municipios en H2 con *warm-up***: las respuestas de municipios se persisten en una
  base **H2** y se precargan al arranque, ya que es una llamada que suele tardar más.
  El resultado es una mejora directa de los tiempos de carga y menos presión sobre el
  rate limit.
- **Caché con TTL para las predicciones**: al ser datos que cambian cada día, una caché
  con caducidad es más adecuada que persistir indefinidamente. Además **protege de
  posibles caídas del servicio de AEMET**, sirviendo el último dato válido.
- API REST en Java 21 y Spring Boot con endpoints de municipios y previsión, soporte de
  unidades (`G_CEL` / `G_FAH`) y validación de DTOs.

## Frontend

- **SPA en Angular** que muestra la previsión del municipio seleccionado.
- **Caché en `localStorage`** del último municipio consultado, para recuperarlo
  automáticamente en la siguiente visita.
- **Autocompletado** de municipios: las sugerencias se muestran en vivo mientras el
  usuario escribe.

## Infraestructura

`docker compose up -d` levanta el stack completo; la clave de AEMET se inyecta por
`.env` y nunca se versiona.
