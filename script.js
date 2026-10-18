'use strict';

// MENU LATERAL

const toggle = document.querySelector('.mobile-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');

function setMenu(open) {
    sidebar.classList.toggle('open', open);

    toggle.setAttribute('aria-expanded', String(open));

    toggle.setAttribute(
        'aria-label',
        open ? 'Fechar menu' : 'Abrir menu'
    );

    toggle.firstElementChild.textContent = open ? '×' : '☰';

    overlay.hidden = !open;

    document.body.classList.toggle('menu-open', open);

    sidebar.inert = !open;
}

toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';

    setMenu(!isOpen);
});

overlay.addEventListener('click', () => {
    setMenu(false);
});

sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        setMenu(false);
    });
});

// Começa com o menu fechado.
setMenu(false);

// Fecha com Escape e mantém a navegação por teclado no menu aberto.
document.addEventListener('keydown', event => {
    const isOpen = sidebar.classList.contains('open');

    if (event.key === 'Escape' && isOpen) {
        setMenu(false);
        toggle.focus();
    }

    if (event.key === 'Tab' && isOpen) {
        const focusable = [
            toggle,
            ...sidebar.querySelectorAll('a')
        ];

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});


// DESTACA A SECÇÃO QUE ESTÁ A SER LIDA
// Mantemos esta navegação até criarmos as páginas independentes.

const navLinks = [
    ...document.querySelectorAll('nav a[href^="#"]')
];

const sections = navLinks.map(link => {
    return document.querySelector(link.getAttribute('href'));
});

function updateActiveLink() {
    const marker = window.scrollY + 150;

let active = sections[0];

if (!active) {
    return;
}
    sections.forEach(section => {
        const sectionTop = (
            section.getBoundingClientRect().top + window.scrollY
        );

        if (sectionTop <= marker) {
            active = section;
        }
    });

    navLinks.forEach(link => {
        const current = link.hash === '#' + active.id;

        link.classList.toggle('active', current);

        if (current) {
            link.setAttribute('aria-current', 'location');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

let queued = false;

window.addEventListener('scroll', () => {
    if (!queued) {
        requestAnimationFrame(() => {
            updateActiveLink();
            queued = false;
        });

        queued = true;
    }
}, {
    passive: true
});

updateActiveLink();


// VÍDEO DE APRESENTAÇÃO
// Preencha data-video no index.html quando existir um vídeo oficial.

const dialog = document.querySelector('#video-dialog');
const video = dialog?.querySelector('video');
const videoButton = document.querySelector('.video-open');

if (dialog && video && videoButton) {

    videoButton.addEventListener('click', () => {
        const source = videoButton.dataset.video.trim();

        video.hidden = !source;

        dialog.querySelector('.video-message').hidden = Boolean(source);

        if (source) {
            video.src = source;
        }

        dialog.showModal();
    });

    dialog.querySelector('.dialog-close').addEventListener('click', () => {
        dialog.close();
    });

    // Fecha ao clicar fora da janela.
    dialog.addEventListener('click', event => {
        const box = dialog.getBoundingClientRect();

        const clickedOutside = (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
        );

        if (clickedOutside) {
            dialog.close();
        }
    });

    // Interrompe o vídeo ao fechar.
    dialog.addEventListener('close', () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
    });

}

// MENU ILUSTRATIVO — EFEITO DE FOLHEAR

const menuBook = document.querySelector('.menu-book');

if (menuBook) {
    const pages = [...menuBook.querySelectorAll('.menu-page')];

    const menuSection = menuBook.closest('.flip-menu-section');

    const controls = menuSection.querySelector('.menu-book-controls');
    const previousButton = controls.querySelector('.menu-previous');
    const nextButton = controls.querySelector('.menu-next');
    const status = controls.querySelector('.menu-book-status');

    const smallScreen = window.matchMedia('(max-width: 600px)');

    let pageIndex = 0;

    function pagesPerView() {
        return smallScreen.matches ? 1 : 2;
    }

    function showMenuPages(direction = '') {
        const count = pagesPerView();

        // Alinha a primeira página do par no computador.
        pageIndex = Math.floor(pageIndex / count) * count;

        pages.forEach((page, index) => {
            const visible = (
                index >= pageIndex &&
                index < pageIndex + count
            );

            page.classList.remove(
                'is-turning-next',
                'is-turning-previous'
            );

            page.hidden = !visible;
        });

        // Reinicia a animação depois de atualizar as páginas.
        void menuBook.offsetWidth;

        if (direction) {
            const animatedIndex = direction === 'next'
                ? Math.min(pageIndex + count - 1, pages.length - 1)
                : pageIndex;

            pages[animatedIndex].classList.add(
                direction === 'next'
                    ? 'is-turning-next'
                    : 'is-turning-previous'
            );
        }

        previousButton.disabled = pageIndex === 0;

        nextButton.disabled = (
            pageIndex + count >= pages.length
        );

        const first = pageIndex + 1;
        const last = Math.min(pageIndex + count, pages.length);

        status.textContent = count === 1
            ? `Página ${first} de ${pages.length}`
            : `Páginas ${first}–${last} de ${pages.length}`;
    }

    previousButton.addEventListener('click', () => {
        if (pageIndex === 0) {
            return;
        }

        pageIndex = Math.max(0, pageIndex - pagesPerView());

        showMenuPages('previous');

        // Mantém o foco num controlo disponível.
        if (previousButton.disabled) {
            nextButton.focus();
        }
    });

    nextButton.addEventListener('click', () => {
        if (pageIndex + pagesPerView() >= pages.length) {
            return;
        }

        pageIndex += pagesPerView();

        showMenuPages('next');

        if (nextButton.disabled) {
            previousButton.focus();
        }
    });

    smallScreen.addEventListener('change', () => {
        showMenuPages();
    });

    menuBook.classList.add('is-interactive');
    controls.hidden = false;

    showMenuPages();
}