let data = JSON.parse(localStorage.getItem("plates")) || [];
let editIndex = null;
let formVisible = false;

const search = document.getElementById("search");

function normalize(text) {
  return text.toUpperCase().replace(/\s|-/g, "");
}

function toggleForm() {
  formVisible = !formVisible;
  document.getElementById("form").classList.toggle("hidden", !formVisible);
}

function save() {
  const plate = document.getElementById("plate").value.toUpperCase();
  const company = document.getElementById("company").value;
  const key = document.getElementById("key").value;

  if (!plate || !company) {
    alert("Completa matrícula y empresa");
    return;
  }

  if (editIndex !== null) {
    data[editIndex] = { plate, company, key };
    editIndex = null;
  } else {
    data.push({ plate, company, key });
  }

  localStorage.setItem("plates", JSON.stringify(data));
  clear();
  render();
  toggleForm();
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
