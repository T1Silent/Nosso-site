// schedule.js - Lógica da agenda simplificada

// Verificar se o Firebase foi inicializado
function checkFirebaseInitialization() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts > 10) {
                clearInterval(checkInterval);
                reject(new Error('Firebase não foi inicializado. Verifique o common.js.'));
            }
        }, 100);
    });
}

// Variáveis globais
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedEventId = null;
let selectedColor = '#6d5dfc';

// Elementos do DOM
const currentMonthElement = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const todayButton = document.getElementById('today-btn');
const calendarContainer = document.getElementById('calendar');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventTitleInput = document.getElementById('event-title');
const eventDescInput = document.getElementById('event-desc');
const saveEventButton = document.getElementById('save-event');
const deleteEventButton = document.getElementById('delete-event');
const eventsContainer = document.getElementById('events-container');
const formTitle = document.getElementById('form-title');
const colorOptions = document.querySelectorAll('.color-option');
const customColorInput = document.getElementById('custom-color-input');

// Nomes dos meses
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julio", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Nomes dos dias da semana
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkFirebaseInitialization()
        .then(() => {
            initAgenda();
        })
        .catch((error) => {
            console.error("Erro na inicialização do Firebase:", error);
            alert("Erro ao conectar com o banco de dados. Verifique o console para detalhes.");
        });
});

function initAgenda() {
    // Definir data atual como padrão
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    eventDateInput.value = formattedToday;
    
    // Renderizar o calendário
    renderCalendar();
    loadEvents();
    
    // Event Listeners
    prevMonthButton.addEventListener('click', goToPreviousMonth);
    nextMonthButton.addEventListener('click', goToNextMonth);
    todayButton.addEventListener('click', goToToday);
    
    saveEventButton.addEventListener('click', saveEvent);
    deleteEventButton.addEventListener('click', deleteEvent);
    
    // Listeners para seleção de cor
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectColor(this.getAttribute('data-color'));
        });
    });
    
    customColorInput.addEventListener('input', function() {
        selectColor(this.value);
    });
    
    // Listener para seleção de data no calendário
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('day-number')) {
            const day = parseInt(e.target.textContent);
            selectDate(day);
        }
    });
}

// Função para renderizar o calendário
function renderCalendar() {
    // Atualizar o cabeçalho com o mês/ano atual
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Limpar o calendário (exceto os cabeçalhos dos dias)
    const dayHeaders = document.querySelectorAll('.day-header');
    calendarContainer.innerHTML = '';
    dayHeaders.forEach(header => calendarContainer.appendChild(header));
    
    // Obter o primeiro dia do mês e o último dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const day = createDayElement(prevMonthLastDay - i, true);
        calendarContainer.appendChild(day);
    }
    
    // Dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && 
                       currentMonth === today.getMonth() && 
                       currentYear === today.getFullYear();
        const day = createDayElement(i, false, isToday);
        calendarContainer.appendChild(day);
    }
    
    // Dias do próximo mês
    const totalCells = 42; // 6 semanas * 7 dias
    const remainingCells = totalCells - (startDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const day = createDayElement(i, true);
        calendarContainer.appendChild(day);
    }
}

// Função para criar elemento de dia
function createDayElement(dayNumber, isOtherMonth, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    const dayNumberElement = document.createElement('div');
    dayNumberElement.className = 'day-number';
    dayNumberElement.textContent = dayNumber;
    
    dayElement.appendChild(dayNumberElement);
    
    // Adicionar data attribute para identificação
    const fullDate = new Date(currentYear, currentMonth, dayNumber);
    const dateString = fullDate.toISOString().split('T')[0];
    dayElement.setAttribute('data-date', dateString);
    
    return dayElement;
}

// Função para navegar para o mês anterior
function goToPreviousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
    loadEvents();
}

// Função para navegar para o próximo mês
function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
    loadEvents();
}

// Função para navegar para a data atual
function goToToday() {
    currentDate = new Date();
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    renderCalendar();
    loadEvents();
    
    // Definir data atual no formulário
    const formattedToday = currentDate.toISOString().split('T')[0];
    eventDateInput.value = formattedToday;
}

// Função para selecionar uma data
function selectDate(day) {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    eventDateInput.value = formattedDate;
    
    // Limpar formulário
    eventTitleInput.value = '';
    eventTimeInput.value = '';
    eventDescInput.value = '';
    selectedEventId = null;
    deleteEventButton.style.display = 'none';
    formTitle.textContent = 'Novo Evento';
    
    // Selecionar cor padrão
    selectColor('#6d5dfc');
}

// Função para selecionar uma cor
function selectColor(color) {
    selectedColor = color;
    customColorInput.value = color;
    
    // Atualizar UI
    colorOptions.forEach(option => {
        if (option.getAttribute('data-color') === color) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Função para carregar eventos do Firebase
function loadEvents() {
    // Limpar eventos existentes no calendário
    document.querySelectorAll('.event-item').forEach(el => {
        el.remove();
    });
    
    // Calcular datas de início e fim do mês
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Buscar eventos do mês
    db.collection('agenda_events')
        .where('date', '>=', firstDayOfMonth.toISOString().split('T')[0])
        .where('date', '<=', lastDayOfMonth.toISOString().split('T')[0])
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const event = doc.data();
                displayEventOnCalendar(event, doc.id);
            });
            
            // Atualizar lista de eventos
            updateEventsList(querySnapshot);
        })
        .catch((error) => {
            console.error("Erro ao carregar eventos: ", error);
        });
}

// Função para exibir evento no calendário
function displayEventOnCalendar(event, id) {
    const eventDate = new Date(event.date);
    const dayNumber = eventDate.getDate();
    
    // Encontrar o elemento do dia correto
    const dayElement = document.querySelector(`.day[data-date="${event.date}"]`);
    
    if (dayElement && eventDate.getMonth() === currentMonth) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.style.backgroundColor = event.color || '#6d5dfc';
        eventElement.textContent = event.title;
        eventElement.setAttribute('data-event-id', id);
        
        eventElement.addEventListener('click', function(e) {
            e.stopPropagation();
            editEvent(id);
        });
        
        dayElement.appendChild(eventElement);
    }
}

// Função para atualizar a lista de eventos
function updateEventsList(querySnapshot) {
    eventsContainer.innerHTML = '';
    
    if (querySnapshot.empty) {
        eventsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-plus"></i><p>Nenhum evento este mês</p></div>';
        return;
    }
    
    // Agrupar eventos por data
    const eventsByDate = {};
    
    querySnapshot.forEach((doc) => {
        const event = doc.data();
        if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = [];
        }
        eventsByDate[event.date].push({...event, id: doc.id});
    });
    
    // Ordenar datas
    const sortedDates = Object.keys(eventsByDate).sort();
    
    // Exibir eventos agrupados por data
    sortedDates.forEach(date => {
        const dateObj = new Date(date);
        const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
        
        const dateHeader = document.createElement('h4');
        dateHeader.textContent = dateFormatted;
        dateHeader.style.marginTop = '15px';
        dateHeader.style.color = '#6d5dfc';
        eventsContainer.appendChild(dateHeader);
        
        eventsByDate[date].forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-card';
            eventElement.style.borderLeftColor = event.color || '#6d5dfc';
            
            eventElement.innerHTML = `
                <div class="event-title">${event.title}</div>
                ${event.time ? `<div class="event-date">${event.time}</div>` : ''}
                ${event.description ? `<div class="event-date">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="btn" onclick="editEvent('${event.id}')">Editar</button>
                    <button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Excluir</button>
                </div>
            `;
            
            eventsContainer.appendChild(eventElement);
        });
    });
}

// Função para salvar evento
function saveEvent() {
    const date = eventDateInput.value;
    const time = eventTimeInput.value;
    const title = eventTitleInput.value;
    const description = eventDescInput.value;
    const color = selectedColor;
    
    if (!date || !title) {
        alert('Por favor, preencha pelo menos a data e o título do evento.');
        return;
    }
    
    const eventData = {
        date: date,
        time: time,
        title: title,
        description: description,
        color: color,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (selectedEventId) {
        // Atualizar evento existente
        db.collection('agenda_events').doc(selectedEventId).update(eventData)
            .then(() => {
                alert('Evento atualizado com sucesso!');
                resetForm();
                loadEvents();
            })
            .catch((error) => {
                console.error("Erro ao atualizar evento: ", error);
                alert('Erro ao atualizar evento. Tente novamente.');
            });
    } else {
        // Adicionar novo evento
        db.collection('agenda_events').add(eventData)
            .then(() => {
                alert('Evento adicionado com sucesso!');
                resetForm();
                loadEvents();
            })
            .catch((error) => {
                console.error("Erro ao adicionar evento: ", error);
                alert('Erro ao adicionar evento. Tente novamente.');
            });
    }
}

// Função para editar evento
function editEvent(eventId) {
    db.collection('agenda_events').doc(eventId).get()
        .then((doc) => {
            if (doc.exists) {
                const event = doc.data();
                eventDateInput.value = event.date;
                eventTimeInput.value = event.time || '';
                eventTitleInput.value = event.title;
                eventDescInput.value = event.description || '';
                
                selectedEventId = eventId;
                deleteEventButton.style.display = 'inline-block';
                formTitle.textContent = 'Editar Evento';
                
                // Selecionar a cor do evento
                if (event.color) {
                    selectColor(event.color);
                }
                
                // Scroll para o formulário
                eventDateInput.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar evento: ", error);
            alert('Erro ao carregar evento. Tente novamente.');
        });
}

// Função para excluir evento
function deleteEvent(eventId = null) {
    const idToDelete = eventId || selectedEventId;
    
    if (!idToDelete) {
        alert('Nenhum evento selecionado para exclusão.');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        db.collection('agenda_events').doc(idToDelete).delete()
            .then(() => {
                alert('Evento excluído com sucesso!');
                resetForm();
                loadEvents();
            })
            .catch((error) => {
                console.error("Erro ao excluir evento: ", error);
                alert('Erro ao excluir evento. Tente novamente.');
            });
    }
}

// Função para reiniciar o formulário
function resetForm() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    eventDateInput.value = formattedToday;
    eventTimeInput.value = '';
    eventTitleInput.value = '';
    eventDescInput.value = '';
    
    selectedEventId = null;
    deleteEventButton.style.display = 'none';
    formTitle.textContent = 'Novo Evento';
    
    selectColor('#6d5dfc');
}