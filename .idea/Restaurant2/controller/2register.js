document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    if (form) {
        form.addEventListener('submit', (e) => {

            e.preventDefault();


            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;


            const newUser = {
                name: username,
                email: email,
                password: password,
            };


            localStorage.setItem('user', JSON.stringify(newUser));

            console.log('Tunnus luotu onnistuneesti! Tervetuloa, ' + username);


            window.location.href = '2Restaurant.html';
        });
    }
});