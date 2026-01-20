// --- VARIABLES GLOBALES (El estado de la app) ---
let usuarios = [];
let menu = [];
let ventas = [];
let carrito = [];
let usuarioLogueado = null;

// Configuración básica
let configuracion = {
    nombreLocal: "Mi Restaurante",
    iva: 16
};

// Referencia al div principal
const mainDiv = document.getElementById('main-content');

// --- CLASES ---
class Usuario {
    constructor(id, username, password, role, name) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.name = name;
    }
}

class Producto {
    constructor(id, name, price, category, stock) {
        this.id = id;
        this.name = name;
        this.price = parseFloat(price);
        this.category = category;
        this.stock = parseInt(stock);
    }
}

// --- INICIO DE LA APP ---
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

// Función asíncrona para cargar datos
async function cargarDatos() {
    // 1. Verificar si hay datos en LocalStorage (Memoria del navegador)
    if(localStorage.getItem('datos_menu')) {
        console.log("Cargando de memoria...");
        // Recuperamos y convertimos el texto a Objetos
        const menuGuardado = JSON.parse(localStorage.getItem('datos_menu'));
        menu = menuGuardado.map(p => new Producto(p.id, p.name, p.price, p.category, p.stock));
        
        usuarios = JSON.parse(localStorage.getItem('datos_usuarios'));
        ventas = JSON.parse(localStorage.getItem('datos_ventas')) || [];
        
        if(localStorage.getItem('datos_config')) {
            configuracion = JSON.parse(localStorage.getItem('datos_config'));
        }
    } else {
        // 2. Si es la primera vez, intentamos leer el JSON
        console.log("Intentando cargar data.json...");
        try {
            const respuesta = await fetch('data/data.json');
            
            // Si el archivo no existe o falla la carga
            if(!respuesta.ok) throw new Error("No se pudo leer data.json");

            const datos = await respuesta.json();
            
            // Llenamos los arrays con los datos del JSON
            usuarios = datos.users;
            menu = datos.menu.map(p => new Producto(p.id, p.name, p.price, p.category, p.stock));
            
            guardarDatos(); // Guardamos para la próxima
        } catch (error) {
            // --- PLAN B: DATOS DE RESPALDO ---
            // Si falla el JSON (ej. error CORS), cargamos esto manualmente
            console.warn("Usando datos de respaldo manuales.");
            
            usuarios = [
                {id:1, username:"admin", password:"123", role:"admin", name:"Gerente"},
                {id:2, username:"mesero", password:"123", role:"mesero", name:"Juan Pérez"}
            ];

            menu = [
                new Producto(1, "Hamburguesa", 150, "Platos", 20),
                new Producto(2, "Papas Fritas", 80, "Entradas", 30),
                new Producto(3, "Refresco", 40, "Bebidas", 50),
                new Producto(4, "Helado", 60, "Postres", 15)
            ];
            
            guardarDatos();
        }
    }

    actualizarTitulo();
    mostrarLogin();
}

function guardarDatos() {
    localStorage.setItem('datos_menu', JSON.stringify(menu));
    localStorage.setItem('datos_usuarios', JSON.stringify(usuarios));
    localStorage.setItem('datos_ventas', JSON.stringify(ventas));
    localStorage.setItem('datos_config', JSON.stringify(configuracion));
}

function actualizarTitulo() {
    const titulo = document.getElementById('tituloApp');
    if(titulo) titulo.innerText = configuracion.nombreLocal;
}

// --- VISTAS (PANTALLAS) ---

// 1. Pantalla de Login
function mostrarLogin() {
    mainDiv.innerHTML = `
        <div class="card" style="max-width: 400px; margin: 50px auto; text-align:center;">
            <h3>Iniciar Sesión</h3>
            <input type="text" id="inputUser" placeholder="Usuario" value="admin">
            <input type="password" id="inputPass" placeholder="Contraseña" value="123">
            <button class="btn-primary" onclick="validarLogin()" style="width:100%; margin-top:10px;">Entrar</button>
            <p style="margin-top:10px; font-size:0.8em; color:#666;">
                Prueba: admin/123 o mesero/123
            </p>
        </div>
    `;
}

function validarLogin() {
    const user = document.getElementById('inputUser').value;
    const pass = document.getElementById('inputPass').value;

    const encontrado = usuarios.find(u => u.username === user && u.password === pass);

    if (encontrado) {
        usuarioLogueado = encontrado;
        
        // Pequeña alerta de bienvenida
        const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
        Toast.fire({icon: 'success', title: `Hola, ${encontrado.name}`});
        
        if (encontrado.role === 'admin') {
            mostrarAdmin();
        } else {
            mostrarMesero();
        }
    } else {
        Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
}

function cerrarSesion() {
    usuarioLogueado = null;
    carrito = [];
    mostrarLogin();
}

// --- VISTA: ADMINISTRADOR ---

function mostrarAdmin() {
    // Calcular totales
    const totalDinero = ventas.reduce((suma, v) => suma + v.total, 0);
    const cantidadVentas = ventas.length;

    mainDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Panel Admin: ${usuarioLogueado.name}</h2>
            <button class="btn-secondary" onclick="cerrarSesion()">Cerrar Sesión</button>
        </div>

        <div class="card">
            <h3>Resumen</h3>
            <p><strong>Ventas Totales:</strong> $${totalDinero.toFixed(2)}</p>
            <p><strong>Tickets Emitidos:</strong> ${cantidadVentas}</p>
            <button class="btn-danger" onclick="borrarTodo()">Resetear Fábrica</button>
        </div>

        <div class="card">
            <h3>Control de Inventario</h3>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaStock">
                    </tbody>
            </table>
        </div>

        <div class="card">
            <h3>Empleados</h3>
            <div style="display:flex; gap:5px; flex-wrap: wrap;">
                <input type="text" id="nuevoNombre" placeholder="Nombre" style="flex: 1;">
                <input type="text" id="nuevoUser" placeholder="Usuario" style="flex: 1;">
                <input type="password" id="nuevoPass" placeholder="Clave" style="flex: 1;">
                
                <select id="nuevoRol" style="padding: 10px; border: 1px solid #ccc; flex: 1;">
                    <option value="mesero">Mesero</option>
                    <option value="admin">Administrador</option>
                </select>

                <button class="btn-success" onclick="agregarEmpleado()">Crear</button>
            </div>
            <table>
                <thead>
                    <tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Acción</th></tr>
                </thead>
                <tbody id="tablaEmpleados"></tbody>
            </table>
        </div>
    `;

    renderizarTablasAdmin();
}

function renderizarTablasAdmin() {
    // ... (la parte de stock déjala igual) ...
    // 1. Render Stock
    const tbodyStock = document.getElementById('tablaStock');
    tbodyStock.innerHTML = ''; 

    menu.forEach(prod => {
        const stockBajo = prod.stock < 5 ? 'color:red; font-weight:bold;' : '';
        tbodyStock.innerHTML += `
            <tr>
                <td>${prod.name}</td>
                <td>$${prod.price}</td>
                <td style="${stockBajo}">${prod.stock}</td>
                <td>
                    <button class="btn-primary" onclick="reponerStock(${prod.id})">Reponer (+5)</button>
                </td>
            </tr>
        `;
    });

    // 2. Render Empleados (ACTUALIZADO PARA MOSTRAR ROL)
    const tbodyEmp = document.getElementById('tablaEmpleados');
    tbodyEmp.innerHTML = '';

    usuarios.forEach((u, index) => {
        let botonBorrar = u.id === usuarioLogueado.id 
            ? '<span style="color:#999">(Tú)</span>' 
            : `<button class="btn-danger" onclick="eliminarUsuario(${index})">Eliminar</button>`;

        tbodyEmp.innerHTML += `
            <tr>
                <td>${u.name}</td>
                <td>${u.username} <span style="font-size:0.8em; color:#666">(${u.role})</span></td>
                <td>${botonBorrar}</td>
            </tr>
        `;
    });
}

function reponerStock(id) {
    const producto = menu.find(p => p.id === id);
    if(producto) {
        producto.stock += 5;
        guardarDatos();
        renderizarTablasAdmin();
        
        // Feedback visual simple
        const Toast = Swal.mixin({toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1000});
        Toast.fire({icon: 'success', title: 'Stock actualizado'});
    }
}

function agregarEmpleado() {
    const nombre = document.getElementById('nuevoNombre').value;
    const user = document.getElementById('nuevoUser').value;
    const pass = document.getElementById('nuevoPass').value;
    const rol = document.getElementById('nuevoRol').value; // LEEMOS EL ROL SELECCIONADO

    if(nombre && user && pass) {
        // Usamos la variable 'rol' en lugar del texto fijo "mesero"
        const nuevo = new Usuario(Date.now(), user, pass, rol, nombre);
        
        usuarios.push(nuevo);
        guardarDatos();
        renderizarTablasAdmin();
        Swal.fire('Listo', `Se creó un nuevo ${rol}`, 'success');
        
        // Opcional: Limpiar los campos después de agregar
        document.getElementById('nuevoNombre').value = '';
        document.getElementById('nuevoUser').value = '';
        document.getElementById('nuevoPass').value = '';
    } else {
        alert("Completa todos los campos");
    }
}

function eliminarUsuario(index) {
    if(confirm("¿Estás seguro de eliminar a este empleado?")) {
        usuarios.splice(index, 1);
        guardarDatos();
        renderizarTablasAdmin();
    }
}

function borrarTodo() {
    if(confirm("¿BORRAR TODO? Se reiniciará la aplicación.")) {
        localStorage.clear();
        location.reload();
    }
}

// --- VISTA: MESERO ---

function mostrarMesero() {
    mainDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h2>Mesero: ${usuarioLogueado.name}</h2>
            <button class="btn-secondary" onclick="cerrarSesion()">Salir</button>
        </div>

        <div style="display:flex; gap: 20px; flex-wrap:wrap;">
            <div style="flex: 2; min-width: 300px;">
                <h3>Carta / Menú</h3>
                <input type="text" placeholder="Buscar plato..." onkeyup="filtrarMenu(this.value)">
                <div id="gridProductos" class="grid-menu" style="margin-top:15px;">
                    </div>
            </div>

            <div style="flex: 1; min-width: 250px; border:1px solid #ccc; padding:15px; background:white;">
                <h3>Ticket Actual</h3>
                <ul id="listaCarrito" style="padding-left: 20px;"></ul>
                <hr>
                <div style="font-size:1.2em; font-weight:bold; text-align:right; margin-bottom:10px;">
                    Total: $<span id="totalCarrito">0.00</span>
                </div>
                <button class="btn-success" style="width:100%; margin-bottom:5px;" onclick="cobrar()">Cobrar</button>
                <button class="btn-danger" style="width:100%" onclick="limpiarCarrito()">Cancelar</button>
            </div>
        </div>
    `;
    renderizarMenu();
    renderizarCarrito();
}

function renderizarMenu(filtro = "") {
    const div = document.getElementById('gridProductos');
    div.innerHTML = ''; // Limpiar

    const filtrados = menu.filter(p => p.name.toLowerCase().includes(filtro.toLowerCase()));

    if(filtrados.length === 0) {
        div.innerHTML = "<p>No hay productos.</p>";
        return;
    }

    filtrados.forEach(prod => {
        const sinStock = prod.stock <= 0;
        
        div.innerHTML += `
            <div class="producto-card" style="${sinStock ? 'opacity:0.6; background:#eee;' : ''}">
                <h4>${prod.name}</h4>
                <p style="color:#c0392b; font-weight:bold;">$${prod.price}</p>
                <p>Stock: ${prod.stock}</p>
                <button class="btn-primary" 
                    onclick="agregarCarrito(${prod.id})" 
                    ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'Agotado' : 'Agregar'}
                </button>
            </div>
        `;
    });
}

function filtrarMenu(texto) {
    renderizarMenu(texto);
}

function agregarCarrito(id) {
    const prod = menu.find(p => p.id === id);
    const enCarrito = carrito.filter(p => p.id === id).length;

    if(prod.stock > enCarrito) {
        carrito.push(prod);
        renderizarCarrito();
    } else {
        Swal.fire('Sin Stock', 'No puedes agregar más unidades', 'warning');
    }
}

function renderizarCarrito() {
    const ul = document.getElementById('listaCarrito');
    ul.innerHTML = '';
    
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.price;
        ul.innerHTML += `
            <li style="margin-bottom:5px;">
                ${item.name} ($${item.price})
                <span style="color:red; cursor:pointer; font-weight:bold; margin-left:10px;" 
                      onclick="quitarDelCarrito(${index})">X</span>
            </li>
        `;
    });

    document.getElementById('totalCarrito').innerText = total.toFixed(2);
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
}

function limpiarCarrito() {
    carrito = [];
    renderizarCarrito();
}

function cobrar() {
    if(carrito.length === 0) return alert("El carrito está vacío");

    const total = carrito.reduce((sum, item) => sum + item.price, 0);

    Swal.fire({
        title: 'Confirmar Venta',
        text: `Cobrar $${total}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cobrar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Descontar Stock Real
            carrito.forEach(itemV => {
                const productoReal = menu.find(p => p.id === itemV.id);
                productoReal.stock--;
            });

            // Guardar Venta
            ventas.push({
                fecha: new Date(),
                total: total,
                items: carrito,
                vendedor: usuarioLogueado.name
            });

            guardarDatos();
            limpiarCarrito();
            renderizarMenu(); // Actualizar stock visual
            
            Swal.fire('¡Venta Exitosa!', '', 'success');
        }
    });
}
