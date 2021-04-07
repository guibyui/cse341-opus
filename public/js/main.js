const menuBtn = document.querySelector('.nav-btn');
const hamburger = document.querySelector('.nav-btn__burger');
const nav = document.querySelector('.nav');
const menuNav = document.querySelector('.nav__list');
const navItems = document.querySelectorAll('.nav__list-item');

let showMenu = false;

menuBtn.addEventListener('click', toggleMenu);

function toggleMenu() {
    if(!showMenu) {
        hamburger.classList.add('open');
        nav.classList.add('open');
        menuNav.classList.add('open');
        navItems.forEach(item => item.classList.add('open'));

        showMenu = true;
    } else {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        menuNav.classList.remove('open');
        navItems.forEach(item => item.classList.remove('open'));

        showMenu = false;
    }
}

const newsEmail = document.querySelector('#newsEmail');
const _csrf = document.querySelector('#_csrf');

function subscribe() {
    const data = { email: newsEmail.value };
    console.log(data);

    fetch('/subscribe', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
            'CSRF-TOKEN': _csrf.value,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        if (data.error) {
            alert("Subscription Unsuccessful");
        } else {
            alert('Thank you for subscribing to our weekly newsletter!');
            newsEmail.value = '';
        }
    })
}