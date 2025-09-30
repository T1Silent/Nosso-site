// common.js - Versão Corrigida
// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC10Hno92NmmXAW4jN251U1JLRQvRqn60E",
    authDomain: "nosso-site-99c95.firebaseapp.com",
    projectId: "nosso-site-99c95",
    storageBucket: "nosso-site-99c95.appspot.com",
    messagingSenderId: "173788414642",
    appId: "1:173788414642:web:39efd3b0895f89e939ffab"
};

// Verificar se o Firebase já foi inicializado
let db, auth;

try {
    // Inicializar Firebase apenas se não foi inicializado antes
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Inicializar serviços
    db = firebase.firestore();
    auth = firebase.auth();
    
    console.log('Firebase inicializado com sucesso');
    
    // Tentar autenticação anônima automaticamente
    auth.signInAnonymously()
        .then(() => {
            console.log('Autenticado anonimamente com sucesso');
        })
        .catch((error) => {
            console.error('Erro na autenticação anônima:', error);
        });
        
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
}

// Funções utilitárias
function showMessage(message, type = 'success') {
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
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            document.body.removeChild(messageEl);
        }
    }, 3000);
}
