// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    initialiseDarkMode();
    initialiseSmoothScrolling();
    animateElementsOnScroll();
    randomKupeFacts();
    
    // Add highlight to current page in navigation (see styles.css .active)
    highlightCurrentPage();

    initialiseChatbot();
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
        'main h2, main p, main ul, main li, .feature, .news-item, .value-card, .leader, img'
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
// See https://github.com/QinCai-rui/kupe-house-facts-api for API server
// API hosted on my Raspberry Pi 5.
// https://pi5-monitor.qincai.xyz
function randomKupeFacts() {
    const factsContainer = document.querySelector('#kupe-facts');
    
    if (factsContainer) {
        const fetchFact = async () => {
            try {
                const response = await fetch('https://kupe-house-api.qincai.xyz/api/fact');
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

// Bot (WIP)
function initialiseChatbot() {
    const chatBox = document.getElementById("chat-box");
    const userMessageInput = document.getElementById("user-message");
    const sendButton = document.getElementById("send-button");
    let isWaitingForResponse = false; // Flag to track if we're waiting for a response

    const appendMessage = (message, sender) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    };

    const sendMessage = async () => {
        const userMessage = userMessageInput.value.trim();
        if (!userMessage || isWaitingForResponse) return; // Don't send if empty or already waiting

        // Display the user's message
        appendMessage(userMessage, "user");
        userMessageInput.value = "";
        
        // Show loading indicator
        isWaitingForResponse = true;
        sendButton.disabled = true;
        userMessageInput.disabled = true;
        appendMessage("...", "bot loading");

        try {
            // Send the message to my Flask API server
            const response = await fetch("https://kupe-house-api.qincai.xyz/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response from the server.");
            }

            // Remove loading indicator
            const loadingIndicator = document.querySelector(".loading");
            if (loadingIndicator) {
                chatBox.removeChild(loadingIndicator);
            }

            const data = await response.json();
            const botMessage = data.response || "Sorry, I couldn't process your request.";
            appendMessage(botMessage, "bot");
        } catch (error) {
            console.error("Error:", error);
            appendMessage("An error occurred. Are you rate-limited?", "bot");
        } finally {
            // Remove loading message if it exists
            const loadingMessage = document.querySelector(".bot.loading");
            if (loadingMessage) {
                chatBox.removeChild(loadingMessage);
            }
            
            // Re-enable input and button
            isWaitingForResponse = false;
            sendButton.disabled = false;
            userMessageInput.disabled = false;
        }
    };

    appendMessage("Hi! Chat to me about Kupe or Kupe House! NOTE: I cannot remember previous messages :(", "bot");

    sendButton.addEventListener("click", sendMessage); // send message when button is clicked
    userMessageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !isWaitingForResponse) sendMessage(); // send messages when Enter key is pressed and not waiting
    });
}