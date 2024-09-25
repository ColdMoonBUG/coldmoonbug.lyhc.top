function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById('current-time').innerText = formattedTime;
}

setInterval(updateTime, 1000);
updateTime();
