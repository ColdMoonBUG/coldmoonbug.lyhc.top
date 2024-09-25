function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById('current-time').textContent = `当前时间：${formattedTime}`;
}

// 每秒更新一次时间
setInterval(updateTime, 1000);

// 页面加载时显示当前时间
updateTime();
