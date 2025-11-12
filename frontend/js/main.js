const homeButton = document.getElementById('homeButton');
const remoteButton = document.getElementById('remoteButton');

function navigateToPage(pageName) {
    window.location.href = pageName; 
}

homeButton.addEventListener('click', function() {
    navigateToPage('./pages/home.html');
});

remoteButton.addEventListener('click', function() {
    navigateToPage('./pages/remote.html');
});