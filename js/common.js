// common.js
// Configuração do Firebase (substitua com suas próprias configurações)
const firebaseConfig = {
    apiKey: "AIzaSyC10Hno92NmmXAW4jN251U1JLRQvRqn60E",
    authDomain: "nosso-site-99c95.firebaseapp.com",
    projectId: "nosso-site-99c95",
    storageBucket: "nosso-site-99c95.appspot.com",
    messagingSenderId: "173788414642",
    appId: "1:173788414642:web:39efd3b0895f89e939ffab"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Funções utilitárias que podem ser usadas em todas as páginas
function showMessage(message, type = 'success') {
    // Criar e exibir uma mensagem para o usuário
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '10px 20px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.zIndex = '1000';
    
    if (type === 'success') {
        messageEl.style.backgroundColor = '#4caf50';
        messageEl.style.color = 'white';
    } else {
        messageEl.style.backgroundColor = '#f44336';
        messageEl.style.color = 'white';
    }
    
    document.body.appendChild(messageEl);
    
    // Remover a mensagem após 3 segundos
    setTimeout(() => {
        document.body.removeChild(messageEl);
    }, 3000);
}