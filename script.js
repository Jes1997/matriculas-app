let data = JSON.parse(localStorage.getItem("plates")) || [];
let editIndex = null;
let formVisible = false;

const search = document.getElementById("search");
const quickPlate = document.getElementById("quickPlate");

function normalize(text) {
  return text.toUpperCase().replace(/\s|-/g, "");
}

function saveStorage() {
  localStorage.setItem("plates", JSON.stringify(data));
}

function toggleForm() {
  formVisible = !formVisible;
  document.getElementById("form").classList.toggle("hidden", !formVisible);

  if (formVisible) {
    setTimeout(() => document.getElementById("plate").focus(), 100);
  }
}

function save(plateValue = null) {

  const plate = (plateValue || document.getElementById("plate").value)
    .toUpperCase()
    .trim();

  const company = document.getElementById("company").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!plate || (!company && editIndex === null)) {
    alert("Completa datos");
    return;
  }

  // 🚫 duplicados
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

function edit(i) {
  if (!formVisible) toggleForm();

  document.getElementById("plate").value = data[i].plate;
  document.getElementById("company").value = data[i].company;
  document.getElementById("key").value = data[i].key || "";

  editIndex = i;
}

function del(i) {
  if (confirm("¿Eliminar?")) {
    data.splice(i, 1);
    saveStorage();
    render();
  }
}

function clear() {
  document.getElementById("plate").value = "";
  document.getElementById("company").value = "";
  document.getElementById("key").value = "";
  editIndex = null;
}

/* 🔍 búsqueda */
search.addEventListener("input", render);

/* ⚡ ENTER = guardado rápido */
quickPlate.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    save(e.target.value);
    e.target.value = "";
  }
});

/* 📤 export */
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "matriculas-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

/* 📥 import */
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

      alert("Importado correctamente");
    } catch {
      alert("Error al importar");
    }
  };

  reader.readAsText(file);
}

/* init */
render();}

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

function edit(i) {
  if (!formVisible) toggleForm();

  document.getElementById("plate").value = data[i].plate;
  document.getElementById("company").value = data[i].company;
  document.getElementById("key").value = data[i].key || "";

  editIndex = i;
}

function del(i) {
  if (confirm("¿Eliminar?")) {
    data.splice(i, 1);
    localStorage.setItem("plates", JSON.stringify(data));
    render();
  }
}

function clear() {
  document.getElementById("plate").value = "";
  document.getElementById("company").value = "";
  document.getElementById("key").value = "";
  editIndex = null;
}

search.addEventListener("input", render);
render();
