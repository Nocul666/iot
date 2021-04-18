const CACHE_NAME = "dowolny-string";
let filesToCache = ["/",
    "index.html",
    "script.js",
    "style.css"
];

self.onsync = event => {
    if (event.tag === 'message-to-log') {
        event.waitUntil(synchronize());
    }
}

self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches
        .open(CACHE_NAME)
        .then(function(cache) {
            return cache.addAll(filesToCache);
        })
        .catch(function(err) {

        })
    );
});
self.addEventListener("fetch", function(evt) {

    evt.respondWith(

        fetch(evt.request).catch(function() {

            return caches.match(evt.request);
        })
    );
});

function isSuccessful(response) {
    return response &&
        response.status === 200 &&
        response.type === 'basic';
}

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if (response) {
                return response;
            }

            return fetch(event.request.clone())
                .then(function(response) {
                    if (!isSuccessful(response)) {
                        return response;
                    }

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, response.clone());
                        });

                    return response;
                });
        })
    );
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        cookieStore.subscribeToChanges([{ name: 'session_id' }])
    );
});

self.addEventListener('cookiechange', (event) => {
    for (const cookie of event.deleted) {
        if (cookie.name === 'session_id') {
            indexedDB.deleteDatabase('user_cache');
            break;
        }
    }
});

function getDataFromDb() {
    return new Promise((resolve, reject) => {
        let db = indexedDB.open('Parking');

        db.onsuccess = () => {
                // Pobierz zawartośc bazy
                db.result.transaction('logObjStore').objectStore('logObjStore').getAll()
                    .onsuccess = (event) => {
                        // Podaj zawarotśc dalej
                        resolve(event.target.result);
                    }
            }
            // W razie bledu wykonaj odpowiednią akcję
        db.onerror = (err) => {
            reject(err);
        }
    });
}

function sendToServer(response) {
    console.log(JSON.stringify(response));
    // return fetch('your server address', {
    //     method: 'POST',
    //     body: JSON.stringify(response),
    //     headers:{
    //         'Content-Type': 'application/json'
    //     }
    // })
    // .catch(err => {
    //     return err;
    // });
}

function synchronize() {
    return getDataFromDb()
        .then(sendToServer)
        .catch(function(err) {
            return err;
        });
}