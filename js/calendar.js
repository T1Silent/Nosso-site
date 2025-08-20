const monthLabel = $('#monthLabel');
const grid = $('#calendarGrid');
const noteModal = document.getElementById('noteModal');
const noteText = document.getElementById('noteText');
const modalDateLabel = document.getElementById('modalDateLabel');

let current = new Date(); // mês atual
let selectedISO = null;   // "YYYY-MM-DD"
import { doc, setDoc, getDoc, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// salvar anotação no Firestore
await setDoc(doc(db, "calendar", selectedISO), {
  note: noteText.value,
  updatedAt: Date.now()
});

// escutar em tempo real (cada vez que mudar, os dois veem igual)
onSnapshot(doc(db, "calendar", selectedISO), (docSnap) => {
  if (docSnap.exists()) {
    noteText.value = docSnap.data().note;
  }
});

function pad(n){ return String(n).padStart(2,'0'); }
function toISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function monthName(y,m){
  return new Date(y,m,1).toLocaleString('pt-BR', { month:'long', year:'numeric' });
}

function fromISODateLocal(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // cria Date no horário local sem deslocar pro dia anterior
}

function render(){
  grid.innerHTML = '';
  // Cabeçalho dos dias da semana
  ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].forEach(d => {
    const h = document.createElement('div');
    h.className = 'weekday';
    h.textContent = d;
    grid.appendChild(h);
  });

  const year = current.getFullYear();
  const month = current.getMonth();

  monthLabel.textContent = monthName(year, month);

  // Primeiro dia do mês (domingo=0)
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0-6

  // Quantos dias no mês e no anterior
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysPrevMonth = new Date(year, month, 0).getDate();

  // Preenche dias do mês anterior para alinhar a grade
  for (let i = startDay - 1; i >= 0; i--){
    const dayNum = daysPrevMonth - i;
    const d = new Date(year, month-1, dayNum);
    grid.appendChild(dayCell(d, true));
  }
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++){
    const d = new Date(year, month, day);
    grid.appendChild(dayCell(d, false));
  }
  // Completa até múltiplo de 7
  const total = grid.children.length;
  const remainder = total % 7;
  if (remainder !== 0){
    const fill = 7 - remainder;
    for (let i = 1; i <= fill; i++){
      const d = new Date(year, month+1, i);
      grid.appendChild(dayCell(d, true));
    }
  }
}

function dayCell(date, notCurrent){
  const iso = toISO(date);
  const cell = document.createElement('div');
  cell.className = 'day' + (notCurrent ? ' not-current' : '');
  const num = document.createElement('div');
  num.className = 'num';
  num.textContent = date.getDate();
  cell.appendChild(num);

  if (notes[iso]) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    cell.appendChild(dot);
    cell.title = notes[iso];
  }

  cell.addEventListener('click', () => {
    selectedISO = iso;
    modalDateLabel.textContent = fromISODateLocal(iso).toLocaleDateString(
    'pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }
  );
  noteText.value = notes[iso] || '';
  noteModal.showModal();
});

  return cell;
}

$('#prevMonth').addEventListener('click', () => { current.setMonth(current.getMonth()-1); render(); });
$('#nextMonth').addEventListener('click', () => { current.setMonth(current.getMonth()+1); render(); });

$('#saveNote').addEventListener('click', () => {
  const txt = noteText.value.trim();
  if (txt) notes[selectedISO] = txt;
  else delete notes[selectedISO];
  storage.set('calendarNotes', notes);
  noteModal.close();
  render();
});

$('#deleteNote').addEventListener('click', () => {
  if (selectedISO && notes[selectedISO]) {
    delete notes[selectedISO];
    storage.set('calendarNotes', notes);
    noteModal.close();
    render();
  }
});

document.addEventListener('DOMContentLoaded', render);
