/* ================================================
   TIENDA.JS — Productos, carrito, Mercado Pago
   ================================================ */

const IMG = {
  tannat: "img/Productos/tannat.png",
  ancellotta: "img/Productos/ancellotta.png",
  freisa: "img/Productos/freisa.png",
  tardio: "img/Productos/tardio.png",
  chardonnay: "img/Productos/chardonnay.png",
  bonarda: "img/Productos/bonarda.png",
  jugo: "img/Productos/jugo.png",
  malbec: "img/Productos/malbec.png",
  cabfranc: "img/Productos/cabfranc.png",
  malbecpinot: "img/Productos/malbecpinot.png",
};


const prods = [
  {id:1, name:"Jugo de Uva 100% Natural", sub:"Sin alcohol", fmt:"6u.", prices:{500:20000,750:30000}, cat:"jugo", dot:"#6aab5e", img:IMG.jugo, consultar:false, sizes:true},
  {id:2, name:"Cosecha Tardío Blanco", sub:"Vino Dulce Natural · Especial", fmt:"6u. × 750 cc", price:60000, cat:"blanco", dot:"#c9a96e", img:IMG.tardio, consultar:false},
  {id:3, name:"Chardonnay", sub:"Serie Varietal · Blanco", fmt:"6u. × 750 cc", price:60000, cat:"blanco", dot:"#b5a460", img:IMG.chardonnay, consultar:false},
  {id:4, name:"Malbec", sub:"Serie Varietal · Tinto", fmt:"6u. × 750 cc", price:72000, cat:"tinto", dot:"#8b3a5a", img:IMG.malbec, consultar:false},
  {id:5, name:"Cabernet Franc", sub:"Serie Varietal · Tinto", fmt:"6u. × 750 cc", price:72000, cat:"tinto", dot:"#7a2535", img:IMG.cabfranc, consultar:false},
  {id:6, name:"Malbec / Pinot Noir", sub:"Reserva · Blend Tinto", fmt:"6u. × 750 cc", price:72000, cat:"tinto", dot:"#6b2040", img:IMG.malbecpinot, consultar:false},
  {id:7, name:"Bonarda / Petit Verdot", sub:"Reserva · Blend Tinto", fmt:"6u. × 750 cc", price:72000, cat:"tinto", dot:"#2a4a8a", img:IMG.bonarda, consultar:false},
  {id:8, name:"Ancellotta", sub:"Varietal · Tinto", fmt:"6u. × 750 cc", price:null, cat:"tinto", dot:"#7a3030", img:IMG.ancellotta, consultar:true},
  {id:9, name:"Freisa", sub:"Varietal · Tinto", fmt:"6u. × 750 cc", price:null, cat:"tinto", dot:"#6b5a3a", img:IMG.freisa, consultar:true},
  {id:10, name:"Tannat", sub:"Varietal · Tinto", fmt:"6u. × 750 cc", price:null, cat:"tinto", dot:"#4a1a28", img:IMG.tannat, consultar:true},
];


const WA = '5491157819412';
const qty={};
const selSize={1:'750'};
prods.forEach(p=>{qty[p.id]=1;});
const cart={};
let cf='all';

function doFilter(cat,btn){
  cf=cat;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderGrid();
}

function selSz(id,sz,el){
  selSize[id]=sz;
  el.closest('.size-sel').querySelectorAll('.sbtn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  const price = prods.find(p=>p.id===id).prices[parseInt(sz)];
  const pEl = document.getElementById('price-'+id);
  if(pEl) pEl.innerHTML = '$'+price.toLocaleString('es-AR')+' <span style="font-size:9px;color:#555;font-weight:300">/ caja</span>';
  const uEl = document.getElementById('unit-'+id);
  if(uEl) uEl.textContent = '$'+Math.round(price/6).toLocaleString('es-AR')+' por botella';
}

function chQty(id,d){
  qty[id]=Math.max(1,qty[id]+d);
  const n=document.getElementById('q'+id),l=document.getElementById('ql'+id);
  if(n)n.textContent=qty[id];
  if(l)l.textContent=qty[id]>1?qty[id]+' cajas':'1 caja';
}

function addCart(id){
  const p=prods.find(x=>x.id===id),q=qty[id];
  let price, fmt, key;
  if(p.sizes){
    const sz = selSize[id]||'750';
    price = p.prices[parseInt(sz)];
    fmt = '6u. × '+sz+' cc';
    key = 'p'+id+'_'+sz;
  } else {
    price = p.price; fmt = p.fmt; key = 'p'+id;
  }
  if(cart[key]){cart[key].qty+=q;cart[key].total+=price*q;}
  else cart[key]={name:p.name,fmt:fmt,up:price,qty:q,total:price*q};
  renderCart();
}

function remCart(k){delete cart[k];renderCart();}

function waLink(nombre){
  const msg=encodeURIComponent('Hola! Quería consultar el precio de '+nombre+' (caja x 6 unidades). ¿Me podés dar info?');
  return 'https://wa.me/'+WA+'?text='+msg;
}

function renderGrid(){
  const g=document.getElementById('pgrid');
  const list=cf==='all'?prods:prods.filter(p=>p.cat===cf);
  g.innerHTML=list.map(p=>{
    let precioHTML, actionHTML;
    if(p.consultar){
      precioHTML=`<div class="caja-badge">Caja × 6 unidades · 750 cc</div><div style="font-size:11px;color:#666;letter-spacing:.06em;font-style:italic;margin-top:4px">Precio a consultar</div>`;
      actionHTML=`<a class="wabtn" href="${waLink(p.name)}" target="_blank">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.882l6.188-1.443A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.031-1.388l-.36-.214-3.732.871.936-3.63-.235-.374A9.818 9.818 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/></svg>
        Consultar precio
      </a>`;
    } else if(p.sizes){
      const sz = selSize[p.id]||'750';
      const pr = p.prices[parseInt(sz)];
      precioHTML=`
        <div class="size-sel">
          <button class="sbtn ${sz==='500'?'on':''}" onclick="selSz(${p.id},'500',this)">500 cc</button>
          <button class="sbtn ${sz==='750'?'on':''}" onclick="selSz(${p.id},'750',this)">750 cc</button>
        </div>
        <div class="caja-badge">Caja × 6 unidades</div>
        <div class="pcaja" id="price-${p.id}">$${pr.toLocaleString('es-AR')} <span style="font-size:9px;color:#555;font-weight:300">/ caja</span></div>
        <div class="punit" id="unit-${p.id}">$${Math.round(pr/6).toLocaleString('es-AR')} por botella</div>`;
      actionHTML=`<div class="qrow">
        <button class="qbtn" onclick="chQty(${p.id},-1)">−</button>
        <span class="qnum" id="q${p.id}">${qty[p.id]}</span>
        <button class="qbtn" onclick="chQty(${p.id},1)">+</button>
        <span class="qlbl" id="ql${p.id}">1 caja</span>
      </div>
      <button class="addbtn" onclick="addCart(${p.id})">Agregar al pedido</button>`;
    } else {
      precioHTML=`<div class="caja-badge">Caja × 6 unidades · 750 cc</div>
        <div class="pcaja">$${p.price.toLocaleString('es-AR')} <span style="font-size:9px;color:#555;font-weight:300">/ caja</span></div>
        <div class="punit">$${Math.round(p.price/6).toLocaleString('es-AR')} por botella</div>`;
      actionHTML=`<div class="qrow">
        <button class="qbtn" onclick="chQty(${p.id},-1)">−</button>
        <span class="qnum" id="q${p.id}">${qty[p.id]}</span>
        <button class="qbtn" onclick="chQty(${p.id},1)">+</button>
        <span class="qlbl" id="ql${p.id}">1 caja</span>
      </div>
      <button class="addbtn" onclick="addCart(${p.id})">Agregar al pedido</button>`;
    }
    return `<div class="pcard">
      <div class="pcard-img"><img src="${p.img}" alt="${p.name}" /></div>
      <div class="pcard-body">
        <span class="dot" style="background:${p.dot}"></span>
        <div class="pname">${p.name}</div>
        <div class="psub">${p.sub}</div>
        <div class="pdiv"></div>
        ${precioHTML}
        ${actionHTML}
      </div>
    </div>`;
  }).join('');
}

const MP_PUBLIC_KEY = 'APP_USR-a9876475-c7d3-4c4d-9aa0-11fbc9808927';
// 🔒 El Access Token (secreto) NO va en el frontend. Vive solo en crear-preferencia.php (backend).
const OWNER_EMAIL = 'maxcorrea81@outlook.com';

// Tarifas de envío estimadas por zona (CP 1426 CABA origen)
// Basadas en rangos de CP argentinos
function estimarEnvio(cp, transportista, totalPeso) {
  const cpNum = parseInt(cp);
  let zona = 'interior';
  if (cpNum >= 1000 && cpNum <= 1499) zona = 'caba';
  else if (cpNum >= 1500 && cpNum <= 1999) zona = 'gba';
  else if (cpNum >= 1600 && cpNum <= 1999) zona = 'gba';
  else if (cpNum >= 6000 && cpNum <= 8999) zona = 'interior';
  else if (cpNum >= 9000) zona = 'patagonia';

  const tarifas = {
    'correo': { caba: 2800, gba: 3500, interior: 5200, patagonia: 8500 },
    'oca':    { caba: 3200, gba: 4100, interior: 6000, patagonia: 9800 },
    'andreani':{ caba: 3500, gba: 4400, interior: 6500, patagonia: 10500 },
    'moto':   { caba: 2200, gba: 3800, interior: null, patagonia: null },
  };
  const t = tarifas[transportista];
  if (!t) return null;
  const base = t[zona];
  if (!base) return null;
  // Ajuste por peso (cada caja ~9kg, 6 botellas)
  const extra = Math.max(0, totalPeso - 1) * 400;
  return base + extra;
}

function calcPeso() {
  return Object.values(cart).reduce((s, i) => s + i.qty, 0);
}

let selectedTransport = null;
let shippingCost = 0;
let cpValido = false;

function selectTransport(t, el) {
  selectedTransport = t;
  document.querySelectorAll('.tbtn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  shippingCost = 0;
  cpValido = false;
  document.getElementById('cp-input').value = '';
  document.getElementById('envio-result').textContent = 'Ingresá tu código postal para calcular el costo.';
  document.getElementById('envio-result').className = 'envio-result';
  updateTotalFinal();
}

function calcularEnvio() {
  if (!selectedTransport) {
    document.getElementById('envio-result').textContent = 'Primero seleccioná un tipo de envío.';
    document.getElementById('envio-result').className = 'envio-result err';
    return;
  }
  const cp = document.getElementById('cp-input').value.trim();
  if (!/^\d{4}$/.test(cp)) {
    document.getElementById('envio-result').textContent = 'Ingresá un código postal válido de 4 dígitos.';
    document.getElementById('envio-result').className = 'envio-result err';
    return;
  }
  const costo = estimarEnvio(cp, selectedTransport, calcPeso());
  if (!costo) {
    document.getElementById('envio-result').textContent = 'Este transportista no llega a esa zona. Elegí otra opción.';
    document.getElementById('envio-result').className = 'envio-result err';
    cpValido = false;
    shippingCost = 0;
  } else {
    const nombres = {correo:'Correo Argentino', oca:'OCA', andreani:'Andreani', moto:'Motomensajería'};
    document.getElementById('envio-result').textContent = `${nombres[selectedTransport]}: $${costo.toLocaleString('es-AR')} estimado a CP ${cp}`;
    document.getElementById('envio-result').className = 'envio-result ok';
    shippingCost = costo;
    cpValido = true;
  }
  updateTotalFinal();
}

function updateTotalFinal() {
  const keys = Object.keys(cart);
  if (!keys.length) return;
  const tot = keys.reduce((s, k) => s + cart[k].total, 0);
  const totIva = Math.round(tot * 1.21);
  const grand = totIva + shippingCost;
  const el = document.getElementById('total-final');
  if (!el) return;
  el.innerHTML = `
    <div class="total-line"><span>Subtotal (sin IVA)</span><span>$${tot.toLocaleString('es-AR')}</span></div>
    <div class="total-line"><span>IVA (21%)</span><span>$${(totIva-tot).toLocaleString('es-AR')}</span></div>
    <div class="total-line"><span>Envío estimado</span><span>${shippingCost ? '$'+shippingCost.toLocaleString('es-AR') : '—'}</span></div>
    <div class="total-line grand"><span>Total</span><span>$${grand.toLocaleString('es-AR')}</span></div>
  `;
  const mpBtn = document.getElementById('mp-btn');
  if (mpBtn) {
    const formOk = document.getElementById('f-nombre')?.value &&
                   document.getElementById('f-email')?.value &&
                   document.getElementById('f-tel')?.value &&
                   document.getElementById('f-dir')?.value &&
                   document.getElementById('f-cp')?.value;
    mpBtn.disabled = !(cpValido && formOk);
  }
}

async function pagarConMP() {
  const nombre = document.getElementById('f-nombre').value.trim();
  const email  = document.getElementById('f-email').value.trim();
  const tel    = document.getElementById('f-tel').value.trim();
  const dir    = document.getElementById('f-dir').value.trim();
  const cp     = document.getElementById('f-cp').value.trim();
  const ciudad = document.getElementById('f-ciudad').value.trim();

  if (!nombre || !email || !tel || !dir || !cp) {
    alert('Por favor completá todos los campos obligatorios.');
    return;
  }

  const keys = Object.keys(cart);
  const tot = keys.reduce((s, k) => s + cart[k].total, 0);
  const totIva = Math.round(tot * 1.21);
  const grand = totIva + shippingCost;

  const nombres = {correo:'Correo Argentino', oca:'OCA', andreani:'Andreani', moto:'Motomensajería'};
  const transportNombre = nombres[selectedTransport] || '';
  const summary = Object.values(cart).map(i => `${i.qty}x ${i.name} (${i.fmt})`).join(', ');

  const btn = document.getElementById('mp-btn');
  btn.disabled = true;
  btn.textContent = 'Procesando...';

  try {
    // Crear preferencia de pago en MP
    const items = Object.values(cart).map(i => ({
      title: i.name,
      quantity: i.qty,
      unit_price: Math.round(i.up * 1.21),
      currency_id: 'ARS'
    }));

    if (shippingCost > 0) {
      items.push({
        title: `Envío - ${transportNombre}`,
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'ARS'
      });
    }

    // El pago se crea en el backend (crear-preferencia.php), donde vive el token secreto.
    const pref = await fetch('crear-preferencia.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        payer: { name: nombre, email: email, phone: { number: tel } },
        external_reference: `CG-${Date.now()}`,
        order: {
          nombre, email, tel, dir, cp, ciudad,
          resumen: summary,
          subtotal: tot,
          iva: totIva - tot,
          envio: shippingCost,
          total: grand,
          transporte: transportNombre
        }
      })
    });

    const prefData = await pref.json();

    if (!prefData.init_point) throw new Error('No se pudo crear la preferencia');

    // Los mails de confirmación los envía el backend (crear-preferencia.php) desde la casilla de DonWeb.

    // Redirigir a Mercado Pago
    window.open(prefData.init_point, '_blank');
    btn.textContent = 'Redirigiendo a Mercado Pago...';

  } catch (err) {
    console.error(err);
    alert('Hubo un error al procesar el pago. Por favor intentá de nuevo o contactanos por WhatsApp.');
    btn.disabled = false;
    btn.innerHTML = '<span class="mp-logo">mercadopago</span> Pagar ahora';
  }
}

async function enviarMails({ nombre, email, tel, dir, cp, ciudad, summary, grand, transportNombre, shippingCost, tot, totIva }) {
  // Usamos EmailJS con servicio gratuito
  // Service ID, Template ID y Public Key de EmailJS - configurados para correagrieco@gmail.com
  const EMAILJS_SERVICE = 'service_r248ngd';
  const EMAILJS_TEMPLATE = 'template_qdq4dn2';
  const EMAILJS_PUBKEY = 'WkQTbIxva970kzMfJ';

  const params = {
    to_name: nombre,
    to_email: email,
    owner_email: OWNER_EMAIL,
    pedido: summary,
    subtotal: '$' + tot.toLocaleString('es-AR'),
    iva: '$' + (totIva - tot).toLocaleString('es-AR'),
    envio: shippingCost ? '$' + shippingCost.toLocaleString('es-AR') : 'A calcular',
    total: '$' + grand.toLocaleString('es-AR'),
    transporte: transportNombre,
    direccion: dir + ', CP ' + cp + (ciudad ? ', ' + ciudad : ''),
    telefono: tel,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params, EMAILJS_PUBKEY);
  } catch(e) {
    console.warn('Mail no enviado:', e);
  }
}

function renderCart(){
  const el=document.getElementById('cartEl');
  const keys=Object.keys(cart);
  if(!keys.length){el.innerHTML='<p class="cart-empty">Aún no seleccionaste ningún producto.</p>';return;}
  const tot=keys.reduce((s,k)=>s+cart[k].total,0);
  const totIva=Math.round(tot*1.21);

  el.innerHTML = keys.map(k=>{
    const i=cart[k];
    return `<div class="citem">
      <div style="flex:1">
        <div class="cin">${i.name}</div>
        <div class="cid">${i.fmt} · ${i.qty} caja${i.qty>1?'s':''} · $${i.up.toLocaleString('es-AR')} c/u</div>
      </div>
      <span class="cprice">$${i.total.toLocaleString('es-AR')}</span>
      <button class="crem" onclick="remCart('${k}')">×</button>
    </div>`;
  }).join('') + `

  <!-- FORMULARIO DATOS DE ENVÍO -->
  <div class="envio-box">
    <div class="envio-title">Datos de entrega</div>

    <div class="form-row">
      <div>
        <label class="form-label">Nombre y apellido *</label>
        <input class="form-input" id="f-nombre" type="text" placeholder="Juan García" oninput="updateTotalFinal()">
      </div>
      <div>
        <label class="form-label">Email *</label>
        <input class="form-input" id="f-email" type="email" placeholder="tu@email.com" oninput="updateTotalFinal()">
      </div>
    </div>
    <div class="form-row">
      <div>
        <label class="form-label">Teléfono *</label>
        <input class="form-input" id="f-tel" type="tel" placeholder="11 1234-5678" oninput="updateTotalFinal()">
      </div>
      <div>
        <label class="form-label">Ciudad</label>
        <input class="form-input" id="f-ciudad" type="text" placeholder="Buenos Aires">
      </div>
    </div>
    <div class="form-row full">
      <div>
        <label class="form-label">Dirección completa *</label>
        <input class="form-input" id="f-dir" type="text" placeholder="Av. Corrientes 1234, Piso 3, Depto B" oninput="updateTotalFinal()">
      </div>
    </div>
    <div class="form-row">
      <div>
        <label class="form-label">Código postal *</label>
        <input class="form-input" id="f-cp" type="text" placeholder="1426" maxlength="4" oninput="updateTotalFinal()">
      </div>
    </div>
  </div>

  <!-- SELECTOR TRANSPORTE -->
  <div class="envio-box">
    <div class="envio-title">Tipo de envío</div>
    <p style="font-size:10px;color:#666;margin-bottom:16px;letter-spacing:.05em">El costo de envío está a cargo del comprador y se suma al total.</p>
    <div class="transport-grid">
      <button class="tbtn" onclick="selectTransport('correo',this)">
        <div class="tbtn-name">Correo Argentino</div>
        <div class="tbtn-desc">3 a 7 días hábiles</div>
      </button>
      <button class="tbtn" onclick="selectTransport('oca',this)">
        <div class="tbtn-name">OCA</div>
        <div class="tbtn-desc">2 a 5 días hábiles</div>
      </button>
      <button class="tbtn" onclick="selectTransport('andreani',this)">
        <div class="tbtn-name">Andreani</div>
        <div class="tbtn-desc">2 a 4 días hábiles</div>
      </button>
      <button class="tbtn" onclick="selectTransport('moto',this)">
        <div class="tbtn-name">Motomensajería</div>
        <div class="tbtn-desc">Solo CABA y GBA · Mismo día</div>
      </button>
    </div>

    <label class="form-label">Código postal de destino</label>
    <div class="cp-row">
      <input class="cp-input" id="cp-input" type="text" placeholder="Ej: 1426" maxlength="4">
      <button class="cp-btn" onclick="calcularEnvio()">Calcular</button>
    </div>
    <div class="envio-result" id="envio-result">Seleccioná un transporte e ingresá tu código postal.</div>
  </div>

  <!-- TOTALES -->
  <div class="total-final-box" id="total-final">
    <div class="total-line"><span>Subtotal (sin IVA)</span><span>$${tot.toLocaleString('es-AR')}</span></div>
    <div class="total-line"><span>IVA (21%)</span><span>$${(totIva-tot).toLocaleString('es-AR')}</span></div>
    <div class="total-line"><span>Envío estimado</span><span>—</span></div>
    <div class="total-line grand"><span>Total</span><span>$${totIva.toLocaleString('es-AR')}</span></div>
  </div>

  <button class="mp-btn" id="mp-btn" onclick="pagarConMP()" disabled>
    <span class="mp-logo">mercadopago</span> Pagar ahora
  </button>
  <p style="font-size:9px;color:#444;text-align:center;margin-top:8px;letter-spacing:.05em">Completá todos los campos y calculá el envío para habilitar el pago</p>
  <p class="clegal">Precios en pesos argentinos. IVA no incluido. Venta mínima: 1 caja completa (6 unidades). Sujeto a cambios sin previo aviso.<br>Los costos de envío son estimados — el transportista puede ajustar el valor final.</p>
  `;
}

renderGrid();

