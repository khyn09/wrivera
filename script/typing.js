window.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('typing-header');
    
    function enableAnimation() {
        header.style.animation = 'typing 3s steps(20, end) 1s forwards'; // Enable the animation
        setTimeout(disableAnimation, 4000); // Wait for the animation to complete and then disable it
    }

    function disableAnimation() {
        header.style.animation = 'none'; // Disable the animation
        setTimeout(enableAnimation, 100); // Enable the animation again after a short delay
    }

    enableAnimation(); // Start the animation initially
});