# 🍔 Sistema de Gestión de Restaurante (Versión Académica)

> **Proyecto Final - Curso de JavaScript**
> Aplicación web funcional para administrar pedidos, inventario y empleados.

### 🔗 **Demo en Vivo:** [Ver Proyecto Online](https://danymb2326.github.io/CoderHouse_JavaScript/)

---

## 📖 Descripción

Este proyecto es un simulador de gestión de restaurante desarrollado con **JavaScript Vanilla**. Fue diseñado priorizando la claridad del código y la facilidad de explicación. Simula una base de datos persistente utilizando el almacenamiento local del navegador (`localStorage`).

El sistema maneja dos perfiles de usuario:
1. **Administrador:** Gestiona empleados, reabastece el inventario y ve reportes básicos.
2. **Mesero:** Toma pedidos, visualiza el menú y genera tickets de venta.

## 🚀 Funcionalidades

### 🔐 Autenticación y Seguridad
* **Login:** Validación de credenciales contra la base de datos.

### 👨‍💼 Panel de Administrador
* **Reportes Simples:** Visualización de total recaudado y cantidad de ventas.
* **Gestión de Personal:**
    * Agregar nuevos empleados seleccionando su rol (Mesero o Admin).
    * Listado de empleados con opción de eliminar.
* **Inventario:**
    * Tabla de productos con precios y stock.
    * **Alerta Visual:** El stock se marca en rojo si quedan menos de 5 unidades.
    * **Reponer Stock:** Botón rápido para sumar 5 unidades al inventario.
* **Reset de Fábrica:** Botón para borrar todos los datos y reiniciar la aplicación.

### 💁‍♂️ Panel de Mesero
* **Menú Digital:** Tabla de productos con buscador en tiempo real.
* **Carrito de Compras:**
    * Agregar productos (valida que haya stock disponible).
    * Eliminar ítems del pedido.
    * Cálculo automático del total a pagar.
* **Procesamiento de Venta:** Descuenta el stock real y guarda la venta en el historial.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5:** Estructura semántica básica.
* **CSS3:** Estilos personalizados (sin frameworks pesados), diseño limpio y legible.
* **JavaScript:**
    * **Lógica:** Uso de variables globales y funciones directas para facilitar la lectura.
    * **DOM:** Manipulación directa mediante `getElementById` e `innerHTML`.
    * **Asincronía:** Uso de `fetch` para cargar datos iniciales.
    * **Respaldo Automático:** Sistema "Plan B" que carga datos internos si falla la lectura del archivo JSON.
* **Librerías:**
    * **SweetAlert2:** Para alertas y notificaciones visuales (reemplazando al `alert` nativo).

---

## 🔑 Usuarios de Prueba

Puedes usar las siguientes credenciales para acceder:

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `123` |
| **Mesero** | `mesero1` | `123` |

---

## 📂 Estructura de Archivos

```text
├── css/
│   └── styles.css      # Hojas de estilo simples
├── js/
│   └── script.js       # Lógica del programa (Variables, Funciones, Eventos)
├── data/
│   └── data.json       # Datos iniciales (Usuarios y Menú)
├── index.html          # Contenedor principal (Raíz del proyecto)
└── README.md           # Documentación del proyecto
