import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase.js';

const provider = new GoogleAuthProvider();
const txtMessageElm = document.querySelector("#txt-message");
const btnSendElm = document.querySelector("#btn-send");
const btnSignInElm = document.querySelector("#btn-sign-in");
const outputElm = document.querySelector("#output");
const loginOverlayElm = document.querySelector("#login-overlay");
const accountElm = document.querySelector("#account");
const { API_BASE_URL } = process.env;
const user = {
    email: '',
    name: '',
    picture: ''
};

onAuthStateChanged(auth, (loggedUser) => {
    if (loggedUser){
        user.email = loggedUser.email;
        user.name = loggedUser.name;
        user.picture = loggedUser.photoURL;
        finalizeLogin();
        loginOverlayElm.classList.add('d-none');
    }
});

btnSignInElm.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then(res => {
            user.name = res.user.displayName;
            user.email = res.user.email;
            user.picture = res.user.photoURL;
            loginOverlayElm.classList.add('d-none');
            finalizeLogin();
        }).catch(err => alert("Failed to sign in"));
});

function finalizeLogin(){
    console.log(user.picture);
    accountElm.style.backgroundImage = `url(${user.picture})`;
}

btnSendElm.addEventListener('click', () => {
    const message = txtMessageElm.value.trim();
    if (!message) return;

    fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    }).then(res => {
        if (res.ok) {
            addChatMessageRecord(message);
            outputElm.scrollTo(0, outputElm.scrollHeight);
            txtMessageElm.value = '';
            txtMessageElm.focus();
        } else {
            alert("Failed to send the chat message, please try again.");
        }
    }).catch(err => alert("Failed to connect with the server, please check the connection."));
});

function addChatMessageRecord(message) {
    const messageElm = document.createElement('div');
    messageElm.classList.add('message', 'others')
    outputElm.append(messageElm);
    messageElm.innerText = message;
}

function loadChatMessages() {
    fetch(`${API_BASE_URL}/messages`)
        .then(req => req.json())
        .then(chatMessages => {
            Array.from(outputElm.children).forEach(child => child.remove());
            chatMessages.forEach(msg => addChatMessageRecord(msg))
        })
        .catch(err => console.log(err));
}

// setInterval(loadChatMessages, 1000);

loadChatMessages();

