(function () {
    const head = document.head;

    const tags = [
        // Apple Touch Icons
        '<link rel="apple-touch-icon" sizes="57x57" href="/logoicon/apple-icon-57x57.png">',
        '<link rel="apple-touch-icon" sizes="60x60" href="/logoicon/apple-icon-60x60.png">',
        '<link rel="apple-touch-icon" sizes="72x72" href="/logoicon/apple-icon-72x72.png">',
        '<link rel="apple-touch-icon" sizes="76x76" href="/logoicon/apple-icon-76x76.png">',
        '<link rel="apple-touch-icon" sizes="114x114" href="/logoicon/apple-icon-114x114.png">',
        '<link rel="apple-touch-icon" sizes="120x120" href="/logoicon/apple-icon-120x120.png">',
        '<link rel="apple-touch-icon" sizes="144x144" href="/logoicon/apple-icon-144x144.png">',
        '<link rel="apple-touch-icon" sizes="152x152" href="/logoicon/apple-icon-152x152.png">',
        '<link rel="apple-touch-icon" sizes="180x180" href="/logoicon/apple-icon-180x180.png">',

        // Android Icons
        '<link rel="icon" type="image/png" sizes="192x192" href="/logoicon/android-icon-192x192.png">',
        '<link rel="icon" type="image/png" sizes="96x96" href="/logoicon/favicon-96x96.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/logoicon/favicon-32x32.png">',
        '<link rel="icon" type="image/png" sizes="16x16" href="/logoicon/favicon-16x16.png">',

        // Manifest & Windows Meta
        '<link rel="manifest" href="/logoicon/manifest.json">',
        '<meta name="msapplication-TileColor" content="#ffffff">',
        '<meta name="msapplication-TileImage" content="/logoicon/ms-icon-144x144.png">',
        '<meta name="theme-color" content="#ffffff">'
    ];

    tags.forEach(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();
        const node = temp.firstChild;
        head.appendChild(node);
    });
})();
