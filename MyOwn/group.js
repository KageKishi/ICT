
function register(){
    document.getElementById('LoginRegister').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    showScreen('registerForm');
}

function login(){
    document.getElementById('LoginRegister').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    showScreen('loginForm');
}

function goBack(){
    document.getElementById('LoginRegister').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
}
