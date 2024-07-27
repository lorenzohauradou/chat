import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

window.generateId = nanoid;
const generateId = () => nanoid();

let posts = [];
const MAX_POSTS = 7;

const getCurrentDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mesi da 0 a 11
    const year = now.getFullYear().toString().slice(2);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} | ${hours}:${minutes}:${seconds}`;
}

function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = posts.map(post => `
        <div class="p-4 bg-gray-800 rounded-md shadow-md transition duration-300 ease-in-out hover:bg-gray-700">
            <div class="mb-2 text-sm text-gray-400">
                ${post.userGender === 'not_specified' 
                    ? `Non specificato, ${post.userAge} anni` 
                    : `${post.userGender === 'male' ? 'Uomo' : 'Donna'}, ${post.userAge} anni`}
            </div>
            <p class="mb-2">${escapeHTML(post.content)}</p>
            <div class="text-right">
                <span class="text-sm text-gray-400">${post.date}</span>
            </div>
        </div>
    `).join('');
    postsContainer.scrollTop = postsContainer.scrollHeight;
}

// Gestione del logout (opzionale)
function handleLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Chiamata alla funzione di verifica dello stato di login all'avvio della pagina principale
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Funzione per eseguire l'escape dell'HTML per prevenire XSS
const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};


// Gestione del login
function handleLogin(event) {
    event.preventDefault();
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    saveUserData(gender, age);
    window.location.href = 'index.html'; // Reindirizza alla pagina principale
}

// Salvataggio dei dati utente
function saveUserData(gender, age) {
    localStorage.setItem('userData', JSON.stringify({ gender, age }));
}

// Verifica dello stato di login
function checkLoginStatus() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html'; // Reindirizza alla pagina di login
    }
}

// Recupero dei dati utente
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// aggiungere il post
function addPost(content) {
    const userData = getUserData();
    const newPost = {
        id: generateId(),
        content,
        date: getCurrentDateTime(),
        userGender: userData.gender,
        userAge: userData.age
    };
    posts.unshift(newPost);
    if (posts.length > MAX_POSTS) {
        posts = posts.slice(0, MAX_POSTS);
    }
    renderPosts();
    savePostsToLocalStorage();
}


// Handle form submission
document.getElementById('postForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPostContent = document.getElementById('newPost').value.trim();
        if (newPostContent) {
            addPost(newPostContent); // Use addPost to handle new posts
            document.getElementById('newPost').value = '';
        }
    });

    
const savePostsToLocalStorage = () => {
    localStorage.setItem('posts', JSON.stringify(posts));
    };

// Function to load posts from localStorage
const loadPostsFromLocalStorage = () => {
    const savedPosts = localStorage.getItem('posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
    };

// Endpoint del backend
const API_URL = 'http://localhost:3000/posts';

// Carica i post dal backend
const loadPostsFromServer = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    posts = data;
    renderPosts();
};

// Aggiungi un nuovo post al backend
const addPost = async (content) => {
    const userData = getUserData();
    const newPost = {
        id: generateId(),
        content,
        date: getCurrentDateTime(),
        userGender: userData.gender,
        userAge: userData.age
    };
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
    });
    const data = await response.json();
    posts.unshift(data);
    if (posts.length > MAX_POSTS) {
        posts = posts.slice(0, MAX_POSTS);
    }
    renderPosts();
};

// Carica i post all'inizio
loadPostsFromServer();


// Carica i post dal localStorage all'inizio
posts = loadPostsFromLocalStorage();

renderPosts();