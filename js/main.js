
// main.js - Simulador integrado con DOM, eventos y localStorage
const IVA = 0.16;
const STORAGE_KEYS = { MENU: "sim_menu_v1", EMP: "sim_empleados_v1", CART: "sim_carrito_v1" };

// ---------- UTILIDADES ----------
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function readFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function formatCurrency(n) { return "$" + n.toFixed(2); }
function logMessage(msg) {
  const el = document.getElementById("messages");
  el.textContent = msg;
}

// ---------- DATOS INICIALES ----------
const defaultMenu = [{"id": 1, "nombre": "Hamburguesa Clásica", "precio": 150.0, "stock": 10}, {"id": 2, "nombre": "Tacos de Arrachera (3 pz)", "precio": 120.0, "stock": 15}, {"id": 3, "nombre": "Refresco Grande", "precio": 45.0, "stock": 50}, {"id": 4, "nombre": "Cerveza Artesanal", "precio": 80.0, "stock": 20}];
const defaultEmpleados = ["Juan Pérez", "Ana García"];

// Inicializa storage si no existe
function ensureInitialData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) saveToStorage(STORAGE_KEYS.MENU, defaultMenu);
  if (!localStorage.getItem(STORAGE_KEYS.EMP)) saveToStorage(STORAGE_KEYS.EMP, defaultEmpleados);
  if (!localStorage.getItem(STORAGE_KEYS.CART)) saveToStorage(STORAGE_KEYS.CART, []);
}

// ---------- RENDERIZADORES ----------
function renderMenu() {
  const menu = readFromStorage(STORAGE_KEYS.MENU, []);
  const container = document.getElementById("menu-list");
  container.innerHTML = "";
  menu.forEach(item => {
    const li = document.createElement("div");
    li.className = "list-group-item";
    li.innerHTML = `
      <div class="menu-item-info">
        <strong>${item.nombre}</strong><br />
        <small>Precio: ${formatCurrency(item.precio)} · Disponibles: ${item.stock}</small>
      </div>
      <div class="btn-group" role="group" aria-label="acciones">
        <button class="btn btn-sm btn-outline-primary btn-add" data-id="${item.id}" ${item.stock<=0 ? "disabled":""}>Agregar</button>
      </div>
    `;
    container.appendChild(li);
  });

  // actualizar select de stock
  const sel = document.getElementById("select-producto");
  sel.innerHTML = "";
  menu.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.nombre} (Disp: ${item.stock})`;
    sel.appendChild(opt);
  });

  // enlazar botones de agregar (delegación simple)
  container.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(parseInt(btn.dataset.id));
    });
  });
}

function renderEmpleados() {
  const empleados = readFromStorage(STORAGE_KEYS.EMP, []);
  const list = document.getElementById("empleados-list");
  list.innerHTML = "";
  empleados.forEach((e, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e}</span><button class="btn btn-sm btn-outline-danger btn-del-emp" data-idx="${idx}">Eliminar</button>`;
    list.appendChild(li);
  });
  list.querySelectorAll(".btn-del-emp").forEach(b => {
    b.addEventListener("click", () => {
      eliminarEmpleado(parseInt(b.dataset.idx));
    });
  });
}

function renderCart() {
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  const container = document.getElementById("cart-list");
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = '<div class="list-group-item">Carrito vacío.</div>';
    return;
  }
  cart.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "list-group-item d-flex justify-content-between align-items-center";
    div.innerHTML = `<div><strong>${it.nombre}</strong><br/><small>${formatCurrency(it.precio)}</small></div>
                     <div><button class="btn btn-sm btn-outline-danger btn-remove" data-idx="${idx}">Quitar</button></div>`;
    container.appendChild(div);
  });

  container.querySelectorAll(".btn-remove").forEach(b => {
    b.addEventListener("click", () => {
      removeFromCart(parseInt(b.dataset.idx));
    });
  });
}

function renderFactura() {
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  const out = document.getElementById("factura-output");
  if (cart.length === 0) {
    out.innerHTML = "<em>No hay items para facturar.</em>";
    return;
  }
  let subtotal = 0;
  let html = "<h5>Ticket de Venta</h5><ul class='mb-2'>";
  cart.forEach(it => { html += `<li>${it.nombre} — ${formatCurrency(it.precio)}</li>`; subtotal += it.precio; });
  html += "</ul>";
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  html += `<div>Subtotal: <strong>${formatCurrency(subtotal)}</strong></div>`;
  html += `<div>IVA (${IVA*100}%): <strong>${formatCurrency(iva)}</strong></div>`;
  html += `<div>Total: <strong>${formatCurrency(total)}</strong></div>`;
  out.innerHTML = html;
}

// ---------- ACCIONES / LÓGICA ----------
function addToCart(id) {
  const menu = readFromStorage(STORAGE_KEYS.MENU, []);
  const producto = menu.find(m => m.id === id);
  if (!producto || producto.stock <= 0) {
    logMessage("Producto no disponible.");
    return;
  }
  // añadir al carrito
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  cart.push({ nombre: producto.nombre, precio: producto.precio, id: producto.id });
  saveToStorage(STORAGE_KEYS.CART, cart);
  // reducir stock
  producto.stock--;
  saveToStorage(STORAGE_KEYS.MENU, menu);
  renderMenu();
  renderCart();
  logMessage(`Agregado: ${producto.nombre}`);
}

function removeFromCart(index) {
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  if (index < 0 || index >= cart.length) return;
  const item = cart.splice(index,1)[0];
  saveToStorage(STORAGE_KEYS.CART, cart);
  // devolver stock al producto
  const menu = readFromStorage(STORAGE_KEYS.MENU, []);
  const prod = menu.find(p => p.id === item.id);
  if (prod) { prod.stock++; saveToStorage(STORAGE_KEYS.MENU, menu); }
  renderMenu();
  renderCart();
  logMessage(`Eliminado del carrito: ${item.nombre}`);
}

function vaciarCarrito() {
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  // devolver stock
  const menu = readFromStorage(STORAGE_KEYS.MENU, []);
  cart.forEach(it => {
    const prod = menu.find(p => p.id === it.id);
    if (prod) prod.stock++;
  });
  saveToStorage(STORAGE_KEYS.MENU, menu);
  saveToStorage(STORAGE_KEYS.CART, []);
  renderMenu();
  renderCart();
  renderFactura();
  logMessage("Carrito vaciado.");
}

function generarFactura() {
  const cart = readFromStorage(STORAGE_KEYS.CART, []);
  if (cart.length === 0) { logMessage("No hay items para facturar."); return; }
  renderFactura();
  // Limpiar carrito después de 'facturar' (simulación de cobro)
  saveToStorage(STORAGE_KEYS.CART, []);
  renderCart();
  logMessage("Factura generada y carrito limpio.");
}

function registrarEmpleado(nombre) {
  if (!nombre || nombre.trim().length === 0) { logMessage("Nombre inválido."); return; }
  const empleados = readFromStorage(STORAGE_KEYS.EMP, []);
  empleados.push(nombre.trim());
  saveToStorage(STORAGE_KEYS.EMP, empleados);
  renderEmpleados();
  logMessage(`Empleado agregado: ${nombre}`);
}

function eliminarEmpleado(idx) {
  const empleados = readFromStorage(STORAGE_KEYS.EMP, []);
  if (idx < 0 || idx >= empleados.length) return;
  const eliminado = empleados.splice(idx,1)[0];
  saveToStorage(STORAGE_KEYS.EMP, empleados);
  renderEmpleados();
  logMessage(`Empleado eliminado: ${eliminado}`);
}

function reabastecerStock(productId, cantidad) {
  const menu = readFromStorage(STORAGE_KEYS.MENU, []);
  const prod = menu.find(p => p.id === productId);
  if (!prod) { logMessage("Producto no encontrado."); return; }
  if (isNaN(cantidad) || cantidad <= 0) { logMessage("Cantidad inválida."); return; }
  prod.stock += cantidad;
  saveToStorage(STORAGE_KEYS.MENU, menu);
  renderMenu();
  logMessage(`Stock actualizado: ${prod.nombre} → ${prod.stock}`);
}

// ---------- EVENTOS Y ARRANQUE ----------
document.addEventListener("DOMContentLoaded", () => {
  ensureInitialData();
  renderMenu();
  renderEmpleados();
  renderCart();
  renderFactura();

  // Form agregar empleado
  document.getElementById("form-empleado").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("input-empleado").value;
    registrarEmpleado(nombre);
    e.target.reset();
  });

  // Form reabastecer
  document.getElementById("form-stock").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById("select-producto").value);
    const qty = parseInt(document.getElementById("input-cantidad").value);
    reabastecerStock(id, qty);
    e.target.reset();
  });

  // Botones factura / vaciar
  document.getElementById("btn-generar-factura").addEventListener("click", generarFactura);
  document.getElementById("btn-vaciar-carrito").addEventListener("click", vaciarCarrito);

  // Reset data
  document.getElementById("btn-reset-storage").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.EMP);
    localStorage.removeItem(STORAGE_KEYS.CART);
    ensureInitialData();
    renderMenu(); renderEmpleados(); renderCart(); renderFactura();
    logMessage("Datos restablecidos a valores de ejemplo.");
  });

  // Generar descarga JSON del menu actual
  document.getElementById("download-json").addEventListener("click", (e) => {
    const menu = readFromStorage(STORAGE_KEYS.MENU, []);
    const blob = new Blob([JSON.stringify(menu, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = e.target;
    a.href = url;
    // filename ya indicado en HTML
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  });

  logMessage("Simulador listo para usarse.");
});
