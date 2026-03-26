let data = JSON.parse(localStorage.getItem("plates")) || [];
let editIndex = null;

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
}

function render() {
  const search = document.getElementById("search").value.toUpperCase();
  const list = document.getElementById("list");

  list.innerHTML = "";

  data
    .filter(x => x.plate.includes(search))
    .forEach((x, i) => {
      list.innerHTML += `
        <div class="card">
          <b>${x.plate}</b><br>
          ${x.company}<br>
          ${x.key ? "🔑 " + x.key : ""}
          <br><br>
          <button class="edit" onclick="edit(${i})">Editar</button>
          <button class="delete" onclick="del(${i})">Eliminar</button>
        </div>
      `;
    });
}

function edit(i) {
  plate.value = data[i].plate;
  company.value = data[i].company;
  key.value = data[i].key || "";
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
  plate.value = "";
  company.value = "";
  key.value = "";
}

search.addEventListener("input", render);
render();