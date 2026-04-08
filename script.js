let data = JSON.parse(localStorage.getItem("plates")) || [];
let editIndex = null;
let formVisible = false;
let lastCompany = "";

const search = document.getElementById("search");
const quickPlate = document.getElementById("quickPlate");

const plateInput = document.getElementById("plate");
const companyInput = document.getElementById("company");
const keyInput = document.getElementById("key");

let history = [];

/* 🔤 normalizar */
function normalize(text) {
  return text.toUpperCase().replace(/\s|-/g, "");
}

/* 💾 guardar */
function saveStorage() {
  localStorage.setItem("plates", JSON.stringify(data));
}

/* 📳 feedback (vibración + animación) */
function feedback() {
  if ("vibrate" in navigator) {
    navigator.vibrate(50);
  }

  document.body.style.transform = "scale(0.98)";
  setTimeout(() => {
    document.body.style.transform = "scale(1)";
  }, 100);
}

/* 🔝 autofocus */
window.addEventListener("load", () => {
  quickPlate.focus();
});

/* 👁 formulario */
function toggleForm() {
  formVisible = !formVisible;
  document.getElementById("form").classList.toggle("hidden", !formVisible);

  if (formVisible) {
    setTimeout(() => plateInput.focus(), 100);
  }
}

/* ❌ cancelar */
function cancelEdit() {
  editIndex = null;
  clear();
  toggleForm();
}

/* 💾 guardar */
function save(plateValue = null) {
  const plate = (plateValue || plateInput.value).toUpperCase().trim();
  let company = companyInput.value.trim() || lastCompany;
  const key = keyInput.value.trim();

  if (!plate || (!company && editIndex === null)) {
    alert("Completa datos");
    return;
  }

  const exists = data.some((x, i) =>
    x.plate === plate && i !== editIndex
  );

  if (exists) {
    alert("Esa matrícula ya existe");
    return;
  }

  if (company) lastCompany = company;

  if (editIndex !== null) {
    data[editIndex] = { plate, company, key };
    editIndex = null;
  } else {
    data.push({ plate, company, key });
  }

  /* 📊 historial */
  history.unshift(plate);
  history = [...new Set(history)].slice(0, 5);

  saveStorage();
  clear();
  render();
  feedback();

  if (formVisible) toggleForm();
}

/* 🔍 render */
function render() {
  const value = search.value;
  const list = document.getElementById("list");

  list.innerHTML = "";

  /* 📊 contador */
  list.innerHTML += `<p>Total: ${data.length}</p>`;

  /* 📌 historial */
  if (history.length > 0) {
    list.innerHTML += `
      <div class="card">
        <b>Últimos:</b><br>
        ${history.join(" - ")}
      </div>
    `;
  }

  if (!value) {
    list.innerHTML += "<p>🔍 Escribe una matrícula para buscar</p>";
    return;
  }

  let results = data.filter(x =>
    normalize(x.plate).includes(normalize(value))
  );

  /* 🧠 exact match primero */
  results.sort((a, b) => {
    const exactA = normalize(a.plate) === normalize(value);
    const exactB = normalize(b.plate) === normalize(value);
    return exactB - exactA;
  });

  if (results.length === 0) {
    list.innerHTML += "<p>No encontrado</p>";
    return;
  }

  results.forEach(x => {
    const realIndex = data.findIndex(d => d.plate === x.plate);

    list.innerHTML += `
      <div class="card">
        <b>${x.plate}</b><br>
        ${x.company}<br>
        ${x.key ? "🔑 " + x.key : ""}
        <br><br>
        <button class="edit" onclick="edit(${realIndex})">Editar</button>
        <button class="delete" onclick="del(${realIndex})">Eliminar</button>
      </div>
    `;
  });
}

/* ✏️ editar */
function edit(i) {
  if (!formVisible) toggleForm();

  plateInput.value = data[i].plate;
  companyInput.value = data[i].company;
  keyInput.value = data[i].key || "";

  editIndex = i;
}

/* 🗑 eliminar */
function del(i) {
  if (confirm("¿Eliminar?")) {
    data.splice(i, 1);
    saveStorage();
    render();
  }
}

/* 🧹 limpiar */
function clear() {
  plateInput.value = "";
  companyInput.value = "";
  keyInput.value = "";
  editIndex = null;
}

/* ⚡ entrada rápida */
quickPlate.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    save(e.target.value);
    e.target.value = "";
  }
});

/* 🔍 búsqueda */
search.addEventListener("input", render);

/* 📤 export */
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "matriculas-backup.json";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/* 📥 import */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      let text = e.target.result.trim();

      // 🔥 limpiar caracteres raros (WhatsApp, Android, etc)
      text = text.replace(/^\uFEFF/, "");

      let imported = JSON.parse(text);

      // 🔥 asegurar que es array
      if (!Array.isArray(imported)) {
        imported = [imported];
      }

      // 🔥 normalizar datos
      data = imported.map(item => ({
        plate: (item.plate || "").toString().trim(),
        company: (item.company || "").toString().trim(),
        key: (item.key || "").toString().trim()
      }));

      saveStorage();
      render();

      alert("Importado correctamente: " + data.length + " registros");

    } catch (err) {
      alert("Error al importar: " + err.message);
    }
  };

  reader.readAsText(file);
}

/* 🚀 init */
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark");
}