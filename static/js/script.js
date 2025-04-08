// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    initialiseDarkMode();
    initialiseSmoothScrolling();
    animateElementsOnScroll();
    randomKupeFacts();
    
    // Add highlight to current page in navigation (see styles.css .active)
    highlightCurrentPage();
});

// Dark Mode toggler
function initialiseDarkMode() {
    // NOTE: symbols are somehow not showing up in Firefox
    // (but they are showing up in Chrome and MS Edge)
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.classList.add('mode-toggle');
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.title = 'Toggle Dark Mode';
    
    document.body.appendChild(darkModeToggle);
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeToggle.innerHTML = '🌙';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '☀️';
    }
}

// Smooth scrolling for anchor links
function initialiseSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Animate elements as they scroll into view
function animateElementsOnScroll() {
    // select specific content elements that should be animated (exclude header and footer)
    // (this is a bit of a hack, but it works for now ig)
    const elementsToAnimate = document.querySelectorAll(
        'main h2, main p, main ul, main li, .feature, .news-item, .value-card, .leader'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    elementsToAnimate.forEach(element => {
        // (just in case0 )we are not adding animation to the dark mode toggle
        if (!element.classList.contains('mode-toggle')) {
            element.classList.add('fade-in');
            observer.observe(element);
        }
    });
}

// hHighlight current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    document.querySelectorAll('nav ul li a').forEach(link => {
        if (link.getAttribute('href') === filename) {
            link.classList.add('active');
        }
    });
}

// Display random facts about Kupe
function randomKupeFacts() {
    //todo: make a python/flask powered api server serving the facts
    // and then `fetch` the facts from there
    const factsContainer = document.querySelector('#kupe-facts');
    
    if (factsContainer) {
        const facts = [
            "In Māori tradition, Kupe is celebrated as the first explorer to reach New Zealand.",
            "Kupe named New Zealand 'Aotearoa' meaning 'land of the long white cloud'.",
            "Kupe House's mascot is the kiwi, a flightless bird native to New Zealand.",
            "Kupe House has won multiple competitions, including house sports, at Macleans College.",
            "The values of Kupe House include kindness, understanding, perseverance, and enthusiasm.",
            "Kupe returned to his homeland after discovering New Zealand, promising to return but unfortunately did not.",
            "Kupe's navigational skills allowed him to cross vast stretches of the Pacific Ocean."
            //to do: add more facts
        ];
        
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        factsContainer.textContent = randomFact;
        
        // Change fact every 5 seconds
        setInterval(() => {
            const newFact = facts[Math.floor(Math.random() * facts.length)];
            factsContainer.classList.add('fade-out');
            
            setTimeout(() => {
                factsContainer.textContent = newFact;
                factsContainer.classList.remove('fade-out');
                factsContainer.classList.add('fade-in');
                
                setTimeout(() => {
                    factsContainer.classList.remove('fade-in');
                }, 750);
            }, 750);

        }, 5000);
    }
}