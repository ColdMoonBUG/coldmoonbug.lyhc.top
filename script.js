async function setBackground() {
    try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://www.loliapi.com/acg/');
        if (!response.ok) {
            throw new Error('Network request failed: ' + response.status);
        }

        // Read the image data as a blob
        const imageBlob = await response.blob();

        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(imageBlob);

        // Set the background image
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    } catch (error) {
        console.error('Unable to load background image:', error);
    }
}

function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.innerText = formattedTime;
    }
}

window.onload = function() {
    setBackground();
    setInterval(updateTime, 1000);
    updateTime();
};
