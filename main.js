// =========================================
// 1. VARIABLES, CONSTANTES Y ARRAYS GLOBALES
// =========================================

const IVA = 0.16; // Constante global para el impuesto

// Array de objetos para el menú y stock (simula una base de datos)
let menu = [
    { id: 1, nombre: "Hamburguesa Clásica", precio: 150.00, stock: 10 },
    { id: 2, nombre: "Tacos de Arrachera (3 pz)", precio: 120.00, stock: 15 },
    { id: 3, nombre: "Refresco Grande", precio: 45.00, stock: 50 },
    { id: 4, nombre: "Cerveza Artesanal", precio: 80.00, stock: 20 }
];

// Array simple para empleados
let empleados = ["Juan Pérez", "Ana García"];

// Array para almacenar la orden actual del cliente
let ordenActual = [];

// =========================================
// 2. FUNCIONES DEL SISTEMA
// =========================================

/**
 * Función para mostrar el menú disponible en formato texto.
 * Utiliza un ciclo FOR para recorrer el array de objetos.
 * @returns {string} El menú formateado para mostrar en un prompt/alert.
 */
function obtenerMenuFormateado() {
    let textoMenu = "--- MENÚ DISPONIBLE ---\n";
    for (let i = 0; i < menu.length; i++) {
        // Solo mostramos si hay stock (Condicional IF)
        if (menu[i].stock > 0) {
            textoMenu += `${menu[i].id}. ${menu[i].nombre} - $${menu[i].precio} (Disp: ${menu[i].stock})\n`;
        }
    }
    textoMenu += "-----------------------\nIngrese el ID del producto para agregarlo (o ESC para salir):";
    return textoMenu;
}

/**
 * Función 1 (Esencial): Registrar un nuevo empleado.
 * Entrada: Prompt con el nombre.
 * Proceso: Push al array de empleados.
 * Salida: Alert de confirmación y Console.log del listado actualizado.
 */
function registrarEmpleado() {
    let nombre = prompt("Ingrese el nombre completo del nuevo empleado:");
    if (nombre !== null && nombre.trim() !== "") {
        empleados.push(nombre);
        alert("✅ Empleado registrado con éxito: " + nombre);
        console.log("%cLista de empleados actualizada:", "color: green; font-weight: bold;");
        console.table(empleados); // Uso interesante de la consola
    } else {
        alert("❌ Error: No se ingresó un nombre válido.");
    }
}

/**
 * Función 2 (Esencial): Tomar orden (Núcleo del simulador).
 * Utiliza un ciclo WHILE para permitir múltiples entradas hasta que el usuario decida parar.
 */
function tomarOrden() {
    let ordenando = true;

    while (ordenando) {
        let menuTexto = obtenerMenuFormateado();
        let entrada = prompt(menuTexto);

        // Si el usuario presiona Cancelar o ingresa ESC, salimos del ciclo
        if (entrada === null || entrada.toUpperCase() === "ESC") {
            ordenando = false;
            break;
        }

        let idSeleccionado = parseInt(entrada);

        // Buscamos el producto en el array 'menu' usando FIND (método de array eficiente)
        // Si prefieres usar solo lo básico, podrías usar un ciclo FOR aquí también.
        let producto = menu.find(item => item.id === idSeleccionado);

        if (producto) {
            // Validamos stock con un condicional IF
            if (producto.stock > 0) {
                // Agregamos a la orden actual
                ordenActual.push({
                    nombre: producto.nombre,
                    precio: producto.precio
                });
                // Descontamos stock inmediatamente
                producto.stock--; 
                
                alert(`👍 Agregado: ${producto.nombre}\nQuedan ${producto.stock} unidades.`);
                console.log(`Item agregado: ${producto.nombre}. Stock restante: ${producto.stock}`);
            } else {
                alert("⚠️ Lo sentimos, producto agotado.");
            }
        } else {
            alert("❌ ID de producto no válido. Intente de nuevo.");
        }

        // Confirmación para seguir en el ciclo WHILE
        ordenando = confirm("¿Desea agregar otro producto a la orden?");
    }

    // Al terminar de ordenar, si hay items, preguntamos si quiere generar factura
    if (ordenActual.length > 0) {
        let finalizar = confirm("¿Desea cerrar la cuenta y generar factura ahora?");
        if (finalizar) {
            generarFactura();
        }
    }
}

/**
 * Función 3 (Esencial): Generar Factura.
 * Proceso: Recorre el array ordenActual, suma subtotales, calcula IVA y muestra total.
 */
function generarFactura() {
    if (ordenActual.length === 0) {
        alert("No hay items para facturar.");
        return;
    }

    let subtotal = 0;
    let detalleFactura = "=== TICKET DE VENTA ===\n";

    // Ciclo FOR...OF para recorrer los items de la orden
    for (const item of ordenActual) {
        detalleFactura += `- ${item.nombre}: $${item.precio.toFixed(2)}\n`;
        subtotal += item.precio;
    }

    let montoIVA = subtotal * IVA;
    let total = subtotal + montoIVA;

    detalleFactura += "\n-----------------------\n";
    detalleFactura += `Subtotal: $${subtotal.toFixed(2)}\n`;
    detalleFactura += `IVA (16%): $${montoIVA.toFixed(2)}\n`;
    detalleFactura += `TOTAL A PAGAR: $${total.toFixed(2)}`;

    // Salida final
    alert(detalleFactura);
    console.log(detalleFactura);

    // Limpiamos la orden actual para el siguiente cliente
    ordenActual = [];
}

/**
 * Función de control: Gestiona el stock manualmente (requerimiento extra).
 */
function gestionarStock() {
    console.table(menu); // Muestra el stock actual en consola para referencia
    let idProd = parseInt(prompt("Ingrese el ID del producto a reabastecer (ver consola para detalles):"));
    let producto = menu.find(item => item.id === idProd);

    if (producto) {
        let cantidad = parseInt(prompt(`Stock actual de ${producto.nombre}: ${producto.stock}.\n¿Cuántas unidades desea añadir?`));
        if (!isNaN(cantidad) && cantidad > 0) {
            producto.stock += cantidad;
            alert(`✅ Nuevo stock de ${producto.nombre}: ${producto.stock}`);
            console.log("Stock actualizado:", menu);
        } else {
            alert("❌ Cantidad inválida.");
        }
    } else {
        alert("❌ Producto no encontrado.");
    }
}

// =========================================
// 3. FUNCIÓN PRINCIPAL (INICIO)
// =========================================

function iniciarSimulador() {
    let ejecutar = true;

    while (ejecutar) {
        let opcion = prompt(
            "🍳 BIENVENIDO AL SISTEMA DE RESTAURANTE 🍳\n\n" +
            "Seleccione una opción:\n" +
            "1. Tomar Orden a Cliente\n" +
            "2. Registrar Nuevo Empleado\n" +
            "3. Gestionar Stock de Ingredientes\n" +
            "4. Ver Menu y Stock actual (Consola)\n" +
            "5. Salir"
        );

        switch (opcion) {
            case "1":
                tomarOrden();
                break;
            case "2":
                registrarEmpleado();
                break;
            case "3":
                gestionarStock();
                break;
            case "4":
                console.clear();
                console.log("%c--- ESTADO ACTUAL DEL INVENTARIO ---", "color: blue; font-weight: bold;");
                console.table(menu);
                alert("Revisa la consola (F12) para ver el inventario detallado.");
                break;
            case "5":
            case null: // Maneja si dan click en Cancelar en el menú principal
                alert("Gracias por usar el sistema. ¡Hasta luego!");
                ejecutar = false;
                break;
            default:
                alert("❌ Opción no válida. Intente nuevamente.");
                break;
        }
    }
}

// Mensaje de bienvenida en consola al cargar el archivo
console.log("%cSimulador cargado correctamente. Presiona el botón en el HTML para iniciar.", "color: cyan; background: black; padding: 5px;");main.js
