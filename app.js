// DEMO DATA
const medicines = [
  {code:'1001',name:'Paracetamol 500mg',category:'Pain Relief',price:20,qty:50,minQty:20,expiry:'2026-05-15',supplier:'PharmaCo'},
  {code:'1002',name:'Amoxicillin 250mg',category:'Antibiotic',price:35,qty:30,minQty:15,expiry:'2025-12-20',supplier:'MedSupply'},
  {code:'1003',name:'Vitamin C 1000mg',category:'Supplement',price:15,qty:100,minQty:30,expiry:'2027-03-10',supplier:'VitaLife'},
  {code:'1004',name:'Ibuprofen 400mg',category:'Pain Relief',price:25,qty:8,minQty:20,expiry:'2025-06-30',supplier:'PharmaCo'},
  {code:'1005',name:'Aspirin 100mg',category:'Cardiovascular',price:18,qty:45,minQty:25,expiry:'2026-11-18',supplier:'CardioMed'},
  {code:'1006',name:'Cetirizine 10mg',category:'Allergy',price:22,qty:5,minQty:15,expiry:'2025-04-25',supplier:'AllerCare'},
  {code:'1007',name:'Omeprazole 20mg',category:'Digestive',price:30,qty:35,minQty:20,expiry:'2026-08-12',supplier:'DigestCare'}
];

let cart = [];
let invoiceCounter = 1001;
let invoices = [];
let users = [
  {id:1,username:'admin',password:'1234',fullName:'Ahmed Mohamed',role:'admin',status:'Active'},
  {id:2,username:'pharm1',password:'1234',fullName:'Sara Ali',role:'pharmacist',status:'Active'},
  {id:3,username:'pharm2',password:'1234',fullName:'Omar Hassan',role:'pharmacist',status:'Active'}
];

let currentUser = null;
let currentMedicine = null;

// LOGIN
function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const found = users.find(u => u.username === user && u.password === pass);
  if (!found) {
    document.getElementById('loginError').textContent = 'Invalid credentials';
    return;
  }
  currentUser = found;
  document.getElementById('loginPage').classList.remove('active');
  if (role === 'pharmacist') {
    document.getElementById('pharmacistPage').classList.add('active');
    document.getElementById('loggedUserName').textContent = found.fullName;
    loadInventoryTable();
  } else {
    document.getElementById('adminPage').classList.add('active');
    loadAdminDashboard();
  }
}

function logout() {
  currentUser = null;
  cart = [];
  document.getElementById('pharmacistPage').classList.remove('active');
  document.getElementById('adminPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('loginError').textContent = '';
}

// POS
function searchMedicine() {
  const code = document.getElementById('medCode').value.trim();
  currentMedicine = medicines.find(m => m.code === code);
  if (!currentMedicine) {
    alert('Medicine not found');
    return;
  }
  document.getElementById('medName').textContent = currentMedicine.name;
  document.getElementById('medPrice').textContent = currentMedicine.price + ' EGP';
  document.getElementById('medAvail').textContent = currentMedicine.qty;
  document.getElementById('medExpiry').textContent = currentMedicine.expiry;
}

function addToCart() {
  if (!currentMedicine) {
    alert('Search for a medicine first');
    return;
  }
  const qty = parseInt(document.getElementById('medQty').value) || 1;
  if (qty > currentMedicine.qty) {
    alert('Not enough stock');
    return;
  }
  cart.push({code:currentMedicine.code,name:currentMedicine.name,qty:qty,price:currentMedicine.price});
  currentMedicine.qty -= qty;
  document.getElementById('medAvail').textContent = currentMedicine.qty;
  renderCart();
  document.getElementById('medCode').value = '';
  document.getElementById('medQty').value = 1;
}

function renderCart() {
  const tbody = document.getElementById('cartBody');
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach((item, i) => {
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    const row = `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${lineTotal.toFixed(2)}</td>
      <td><button onclick=\"removeFromCart(${i})\" class=\"remove-btn\">X</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
  document.getElementById('grandTotal').textContent = total.toFixed(2) + ' EGP';
}

function removeFromCart(index) {
  const item = cart[index];
  const med = medicines.find(m => m.code === item.code);
  if (med) med.qty += item.qty;
  cart.splice(index, 1);
  renderCart();
}

function completeSale() {
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  const invNum = 'INV-' + invoiceCounter++;
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  invoices.push({num:invNum,date:new Date().toLocaleString(),pharmacist:currentUser.fullName,items:cart.length,total:total});
  document.getElementById('modalInvoiceNum').textContent = 'Invoice: ' + invNum;
  document.getElementById('modalTotal').textContent = 'Total: ' + total.toFixed(2) + ' EGP';
  document.getElementById('saleModal').style.display = 'flex';
  cart = [];
  renderCart();
  loadInventoryTable();
}

function closeModal() {
  document.getElementById('saleModal').style.display = 'none';
}

// INVENTORY
function loadInventoryTable() {
  const tbody = document.getElementById('inventoryBody');
  tbody.innerHTML = '';
  medicines.forEach(m => {
    const status = m.qty < m.minQty ? '<span class=\"badge-warning\">Low</span>' : '<span class=\"badge-ok\">OK</span>';
    const row = `<tr>
      <td>${m.code}</td>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td>${m.qty}</td>
      <td>${m.minQty}</td>
      <td>${m.price}</td>
      <td>${m.expiry}</td>
      <td>${status}</td>
      <td><button class=\"ship-btn\" onclick=\"addShipment('${m.code}')\">Add Shipment</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function searchInventory() {
  const term = document.getElementById('invSearch').value.toLowerCase();
  const filtered = medicines.filter(m => m.name.toLowerCase().includes(term) || m.code.includes(term));
  const tbody = document.getElementById('inventoryBody');
  tbody.innerHTML = '';
  filtered.forEach(m => {
    const status = m.qty < m.minQty ? '<span class=\"badge-warning\">Low</span>' : '<span class=\"badge-ok\">OK</span>';
    const row = `<tr>
      <td>${m.code}</td>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td>${m.qty}</td>
      <td>${m.minQty}</td>
      <td>${m.price}</td>
      <td>${m.expiry}</td>
      <td>${status}</td>
      <td><button class=\"ship-btn\" onclick=\"addShipment('${m.code}')\">Add Shipment</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function addShipment(code) {
  const qty = prompt('Enter quantity to add:');
  if (!qty || isNaN(qty)) return;
  const med = medicines.find(m => m.code === code);
  if (med) {
    med.qty += parseInt(qty);
    loadInventoryTable();
    alert('Shipment added successfully');
  }
}

function showExpiryAlerts() {
  const today = new Date();
  const alertBox = document.getElementById('expiryAlertBox');
  const tbody = document.getElementById('alertBody');
  tbody.innerHTML = '';
  medicines.forEach(m => {
    const expDate = new Date(m.expiry);
    const daysLeft = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
    let alertMsg = '';
    if (daysLeft < 0) alertMsg = '<span class=\"alert-expired\">EXPIRED</span>';
    else if (daysLeft < 90) alertMsg = '<span class=\"alert-low\">Expiring Soon</span>';
    else if (m.qty < m.minQty) alertMsg = '<span class=\"alert-low\">Low Stock</span>';
    if (alertMsg) {
      const row = `<tr>
        <td>${m.code}</td>
        <td>${m.name}</td>
        <td>${m.qty}</td>
        <td>${m.expiry}</td>
        <td>${alertMsg}</td>
      </tr>`;
      tbody.innerHTML += row;
    }
  });
  alertBox.style.display = 'block';
}

// NAVIGATION
function showSection(sectionId) {
  document.querySelectorAll('#pharmacistPage .section').forEach(s => s.classList.remove('active-section'));
  document.getElementById(sectionId).classList.add('active-section');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
  if (sectionId === 'posSection') document.getElementById('navPOS').classList.add('active-nav');
  else document.getElementById('navInventory').classList.add('active-nav');
}

// ADMIN
function loadAdminDashboard() {
  const todayInvoices = invoices;
  document.getElementById('totalSales').textContent = todayInvoices.length;
  document.getElementById('totalInvoices').textContent = todayInvoices.length;
  const revenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  document.getElementById('totalRevenue').textContent = revenue.toFixed(2) + ' EGP';
  const tbody = document.getElementById('invoicesBody');
  tbody.innerHTML = '';
  todayInvoices.forEach(inv => {
    const row = `<tr>
      <td>${inv.num}</td>
      <td>${inv.date}</td>
      <td>${inv.pharmacist}</td>
      <td>${inv.items}</td>
      <td>${inv.total.toFixed(2)} EGP</td>
    </tr>`;
    tbody.innerHTML += row;
  });
  loadLowStockTable();
  loadUsersTable();
}

function loadLowStockTable() {
  const lowStock = medicines.filter(m => m.qty < m.minQty);
  const tbody = document.getElementById('lowStockBody');
  tbody.innerHTML = '';
  lowStock.forEach(m => {
    const row = `<tr>
      <td>${m.code}</td>
      <td>${m.name}</td>
      <td>${m.qty}</td>
      <td>${m.minQty}</td>
      <td>${m.supplier}</td>
      <td><span class=\"badge-danger\">CRITICAL</span></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function loadUsersTable() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const row = `<tr>
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.fullName}</td>
      <td>${u.role}</td>
      <td><span class=\"badge-ok\">${u.status}</span></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function showAdminSection(sectionId) {
  document.querySelectorAll('#adminPage .section').forEach(s => s.classList.remove('active-section'));
  document.getElementById(sectionId).classList.add('active-section');
  document.querySelectorAll('#adminPage .nav-btn').forEach(b => b.classList.remove('active-nav'));
  event.target.classList.add('active-nav');
}
