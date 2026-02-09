const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUl = document.getElementById("todo-list");

let allTodos = getTodos();
updateTodoList();
todoInput.focus();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  allTodos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  saveTodos();
  updateTodoList();
  todoInput.value = "";
}

function updateTodoList() {
  todoListUl.innerHTML = "";
  allTodos.forEach((todo) => {
    todoListUl.append(createTodoItem(todo));
  });
}

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo";

  // NOTE: todo text is a SPAN (not a label) so taps don’t toggle checkbox
  li.innerHTML = `
    <input type="checkbox" id="${todo.id}">
    <label class="custom-checkbox" for="${todo.id}">
      <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
      </svg>
    </label>

    <span class="todo-text">${todo.text}</span>

    <button class="delete-button" aria-label="Delete todo" title="Delete Task">
      <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960">
        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/>
      </svg>
    </button>
  `;

  // Checkbox → complete
  const checkbox = li.querySelector('input[type="checkbox"]');
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    saveTodos();
  });

  // Delete
  li.querySelector(".delete-button").addEventListener("click", () => {
    allTodos = allTodos.filter(t => t.id !== todo.id);
    saveTodos();
    updateTodoList();
  });

  // Edit behavior
  const textEl = li.querySelector(".todo-text");

  // Desktop: double-click to edit
  textEl.addEventListener("dblclick", () => {
    if (!todo.completed && !li.classList.contains("editing")) {
      startEditing(todo, li);
    }
  });

  // Mobile: single tap to edit
  textEl.addEventListener("click", () => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      if (!todo.completed && !li.classList.contains("editing")) {
        startEditing(todo, li);
      }
    }
  });

  return li;
}

function startEditing(todo, li) {
  const textSpan = li.querySelector(".todo-text");

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.text;
  input.className = "todo-edit";

  li.replaceChild(input, textSpan);
  li.classList.add("editing");

  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishEditing(todo, input.value);
    if (e.key === "Escape") updateTodoList();
  });

  input.addEventListener("blur", () => {
    finishEditing(todo, input.value);
  });
}

function finishEditing(todo, value) {
  const text = value.trim();
  if (!text) return updateTodoList();

  todo.text = text;
  saveTodos();
  updateTodoList();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}

function getTodos() {
  return JSON.parse(localStorage.getItem("todos") || "[]");
}
