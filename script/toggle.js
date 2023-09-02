const menuElement = document.querySelector('.menu');
const toggleElement = document.querySelector('.toggle');

// Add a click event listener to the toggle element
toggleElement.addEventListener('click', function() {
    // Toggle the "active" class on the toggle element
    this.classList.toggle('active');

    // Toggle the visibility of the menu
    menuElement.classList.toggle('active');
});