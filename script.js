let data = JSON.parse(localStorage.getItem("plates")) || [];
let editIndex = null;
let formVisible = false;

const search = document.getElementById("search");
const quickPlate = document.getElementById("quickPlate");

const plateInput = document.getElementById("plate");
const companyInput = document.getElementById("company");
const keyInput = document.getElementById("key");

/* 🔤 normalizar búsqueda */
function normalize(text) {
  return text.toUpperCase().replace(/\s|-/g, "");
}

/* 💾 guardar en localStorage */
function saveStorage() {
  localStorage.setItem("plates", JSON.stringify(data));
}

/* 👁 mostrar/ocultar formulario */
function toggleForm() {
  formVisible = !formVisible;
  document.getElementById("form").classList.toggle("hidden", !formVisible);

  if (formVisible) {
    setTimeout(() => plateInput.focus(), 100);
  }
}

/* ❌ cancelar edición */
function cancelEdit() {
  editIndex = null;
  clear();
  toggleForm();
}

/* 💾 guardar registro */
function save(plateValue = null) {
  const plate = (plateValue || plateInput.value).toUpperCase().trim();
  const company = companyInput.value.trim();
  const key = keyInput.value.trim();

  if (!plate || (!company && editIndex === null)) {
    alert("Completa datos");
    return;
  }

  // 🚫 evitar duplicados
  const exists = data.some((x, i) =>
    x.plate === plate && i !== editIndex
  );

  if (exists) {
    alert("Esa matrícula ya existe");
    return;
  }

  if (editIndex !== null) {
    data[editIndex] = { plate, company, key };
    editIndex = null;
  } else {
    data.push({ plate, company, key });
  }

  saveStorage();
  clear();
  render();

  if (formVisible) toggleForm();
}

/* 🔍 render lista */
function render() {
  const value = search.value;
  const list = document.getElementById("list");

  list.innerHTML = "";

  if (!value) {
    list.innerHTML = "<p>🔍 Escribe una matrícula para buscar</p>";
    return;
  }

  const results = data.filter(x =>
    normalize(x.plate).includes(normalize(value))
  );

  if (results.length === 0) {
    list.innerHTML = "<p>No encontrado</p>";
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

/* 🧹 limpiar inputs */
function clear() {
  plateInput.value = "";
  companyInput.value = "";
  keyInput.value = "";
  editIndex = null;
}

/* ⚡ entrada rápida con ENTER */
quickPlate.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    save(e.target.value);
    e.target.value = "";
  }
});

/* 🔍 búsqueda en tiempo real */
search.addEventListener("input", render);

/* 📤 exportar JSON */
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

/* 📥 importar JSON */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Archivo inválido");
        return;
      }

      data = imported;
      saveStorage();
      render();

      alert("Datos importados correctamente");
    } catch {
      alert("Error al importar archivo");
    }
  };

  reader.readAsText(file);
}

/* 🚀 init */
render();