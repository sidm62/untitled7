document.addEventListener('DOMContentLoaded', function(){
    const loginform = document.getElementById('login-form');

    if(loginform){
        loginform.addEventListener('submit', function(e){
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const storedUser = JSON.parse(localStorage.getItem('user'));

            if(storedUser && storedUser.name === username && storedUser.password === password){
                console.log('Login successful!');
                window.location.href = '2Restaurant.html';
            } else {
                alert('Invalid username or password!');
            }
        });
    };
//

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn){
        logoutBtn.addEventListener('click', function(){
            localStorage.removeItem('user');
            console.log('Logged out successfully!');
            window.location.href = 'login.html';
        });
    }
});
