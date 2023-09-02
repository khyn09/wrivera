// Function to hide the scroll-icon
function hideScrollIcon() {
    const scrollIcon = document.querySelector('.scroll-icon');
    scrollIcon.classList.add('hidden');
  }

  // Function to show the scroll-icon
  function showScrollIcon() {
    const scrollIcon = document.querySelector('.scroll-icon');
    scrollIcon.classList.remove('hidden');
  }

  // Get a reference to the scroll-icon element
  var scrollIcon = document.querySelector('.scroll-icon');

  // Add an event listener to detect when the user scrolls
  window.addEventListener('scroll', function () {
    if (window.scrollY > 0) {
      hideScrollIcon();
    } else {
      showScrollIcon();
    }
  });

  // Add a click event listener to the scroll-icon
  scrollIcon.addEventListener('click', function () {
    // Calculate the scroll distance based on your desired scroll target
    var scrollTarget = document.documentElement.clientHeight; // You can change this value
    var scrollDuration = 500; // Scroll duration in milliseconds (shortened for faster animation)

    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth' // This makes the scroll smooth without a delay
    });
  });