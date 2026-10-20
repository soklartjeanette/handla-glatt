'use strict';

const STORAGE_KEY = 'handla-glatt-items-v1';
const form = document.querySelector('#add-form');
const input = document.querySelector('#item-name');
const list = document.querySelector('#items');
const clearButton = document.querySelector('#clear');
const status = document.querySelector('#status');
let items = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) {
    items = saved.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim() && typeof item.done === 'boolean');
  }
} catch {
  document.querySelector('#storage-note').textContent = 'Sparade varor kunde inte läsas. Listan fungerar, men kontrollera att lagring är tillåten i webbläsaren.';
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    document.querySelector('#storage-note').textContent = 'Listan kunde inte sparas. Dina ändringar finns bara kvar tills sidan stängs eller laddas om.';
  }
}

function render(focusId) {
  list.replaceChildren();
  const sorted = items.filter(item => !item.done).concat(items.filter(item => item.done));
  for (const item of sorted) {
    const row = document.createElement('li');
    row.className = item.done ? 'item done' : 'item';
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.done;
    checkbox.setAttribute('aria-label', `${item.done ? 'Markera som ej köpt' : 'Bocka av'}: ${item.name}`);
    checkbox.addEventListener('change', () => {
      item.done = checkbox.checked;
      save();
      render(item.id);
      status.textContent = `${item.name} ${item.done ? 'avbockad' : 'åter på listan'}.`;
    });
    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;
    label.append(checkbox, name);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Ta bort ${item.name}`);
    remove.addEventListener('click', () => {
      const position = sorted.findIndex(candidate => candidate.id === item.id);
      items = items.filter(candidate => candidate.id !== item.id);
      save();
      render(sorted[position + 1]?.id || sorted[position - 1]?.id);
      if (!items.length) input.focus();
      status.textContent = `${item.name} borttagen.`;
    });
    row.append(label, remove);
    list.append(row);
    if (item.id === focusId) checkbox.focus();
  }
  const completed = items.filter(item => item.done).length;
  document.querySelector('#count').textContent = `${items.length - completed} kvar`;
  document.querySelector('#completed-count').textContent = `${completed} avbockade`;
  document.querySelector('#empty').hidden = items.length > 0;
  clearButton.disabled = completed === 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = input.value.trim();
  if (!name) {
    input.value = '';
    input.focus();
    return;
  }
  items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, done: false });
  save();
  render();
  input.value = '';
  input.focus();
  status.textContent = `${name} tillagd.`;
});

clearButton.addEventListener('click', () => {
  const count = items.filter(item => item.done).length;
  items = items.filter(item => !item.done);
  save();
  render();
  input.focus();
  status.textContent = `${count} avbockade varor rensade.`;
});

render();
