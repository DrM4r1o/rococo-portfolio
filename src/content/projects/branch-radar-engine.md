---
title: 'BranchRadar Engine'
description: 'Aplicación de escritorio que audita la calidad del código con un LLM: analiza diffs de ramas, la consistencia entre repositorios y el mantenimiento de ramas.'
year: 2026
role: 'Creador · Full-Stack'
stack: ['Tauri 2', 'Angular 22', 'Rust', 'PrimeNG', 'Transloco']
repo: 'https://github.com/DrM4r1o/branch-radar-engine'
featured: true
pubDate: 2026-09-01
---

**BranchRadar Engine** es una herramienta de escritorio multiplataforma que revisa la
calidad del código con un LLM. Orquesta CLIs de IA externas (Claude Code u OpenCode Go),
les entrega el diff y tus directrices, y parsea sus respuestas.

## Capacidades

- **Proyectos**: agrupa los repos de una funcionalidad y analiza una rama frente a su
  base, con comprobación opcional de consistencia entre repositorios.
- **Mantenimiento de ramas**: auditoría completa y luego incremental, manteniendo
  abiertos o resueltos los hallazgos entre ejecuciones.
- **Entorno multiplataforma**: resolución de ejecutables y `PATH` en Windows y macOS.

## Ingeniería

- Frontend en **Angular 22** con **PrimeNG** y **Transloco** para la interfaz y los
  idiomas; estado gestionado con la API moderna del framework.
- Núcleo en **Rust** sobre **Tauri 2**, con CI que compila el frontend y ejecuta
  `cargo test` y `cargo clippy`, además de un flujo de releases por tag.

Distribuye instaladores sin firmar para Windows, macOS (arm64) y Linux bajo licencia MIT.
