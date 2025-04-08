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

// Display random facts about Kupe (fetch from API)
function randomKupeFacts() {
    const factsContainer = document.querySelector('#kupe-facts');
    
    if (factsContainer) {
        const fetchFact = async () => {
            try {
                const response = await fetch('https://kupe-house-facts.qincai.xyz/api');
                if (!response.ok) {
                    throw new Error('Failed to fetch facts');
                }
                const data = await response.json();
                return data.fact;
            } catch (error) {
                console.error('Error fetching fact:', error);
                return "Could not load a fact right now. Please try again later.";
            }
        };

        const updateFact = async () => {
            const fact = await fetchFact();
            factsContainer.textContent = fact;
        };

        // Fetch and display the first fact
        updateFact();

        // Change fact every 5 seconds
        setInterval(async () => {
            factsContainer.classList.add('fade-out');
            
            setTimeout(async () => {
                await updateFact();
                factsContainer.classList.remove('fade-out');
                factsContainer.classList.add('fade-in');
                
                setTimeout(() => {
                    factsContainer.classList.remove('fade-in');
                }, 750);
            }, 750);
        }, 5000); // 5000ms = 5s
    }
}