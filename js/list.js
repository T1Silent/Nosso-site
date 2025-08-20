const form = $('#todoForm');
const input = $('#todoInput');
const listEl = $('#todoList');
const filterBtns = $$('.filters .btn');

import { collection, addDoc, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// adicionar item
await addDoc(collection(db, "todos"), {
  text: newTodo,
  done: false,
  createdAt: Date.now()
});

// escutar em tempo real
onSnapshot(collection(db, "todos"), (snapshot) => {
  const todos = [];
  snapshot.forEach((doc) => todos.push({ id: doc.id, ...doc.data() }));
  renderTodos(todos);
});

let filter = 'all';

function render(){
  listEl.innerHTML = '';
  let items = todos;
  if (filter === 'pending') items = todos.filter(t => !t.done);
  if (filter === 'done') items = todos.filter(t => t.done);

  items.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');

    const left = document.createElement('div');
    left.className = 'todo-left';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.done;
    chk.addEventListener('change', () => {
      t.done = chk.checked;
      storage.set('todos', todos);
      render();
    });

    const title = document.createElement('p');
    title.className = 'todo-title' + (t.done ? ' done' : '');
    title.textContent = t.title;

    left.appendChild(chk);
    left.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const del = document.createElement('button');
    del.className = 'btn danger';
    del.textContent = 'Excluir';
    del.addEventListener('click', () => {
      todos = todos.filter(x => x.id !== t.id);
      storage.set('todos', todos);
      render();
    });

    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  todos.unshift({ id: crypto.randomUUID(), title, done:false, createdAt: Date.now() });
  storage.set('todos', todos);
  input.value = '';
  render();
});

filterBtns.forEach(b => {
  b.addEventListener('click', () => {
    filter = b.dataset.filter;
    filterBtns.forEach(x => x.classList.toggle('outline', x !== b));
    render();
  });
});

document.addEventListener('DOMContentLoaded', render);
