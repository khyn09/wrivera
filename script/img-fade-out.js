// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the image element
    const imageElement = document.querySelector(".fade-in-left");

    // Add the 'fade-out' class to trigger the fade-out animation
    imageElement.classList.add("fade-out");

    // After a delay, remove the 'fade-out' class to reset the element
    setTimeout(function() {
        imageElement.classList.remove("fade-out");
    }, 1000); // Adjust the delay as needed (1 second in this case)


});