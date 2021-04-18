const CACHE_NAME = "dowolny-string";
// List of files which are store in cache.
let filesToCache = ["/", "Capture1.png", "script.js"];
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(filesToCache);
      })
      .catch(function (err) {
        // Snooze errors...
        // console.error(err);
      })
  );
});
self.addEventListener("fetch", function (evt) {
  // Snooze logs...
  // console.log(event.request.url);
  evt.respondWith(
    // Firstly, send request..
    fetch(evt.request).catch(function () {
      // When request failed, return file from cache...
      return caches.match(evt.request);
    })
  );
});

function isSuccessful(response) {
  return response &&
    response.status === 200 &&
    response.type === 'basic';
}

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response; // Cache hit
        }

        return fetch(event.request.clone())
          .then(function (response) {
            if (!isSuccessful(response)) {
              return response;
            }

            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, response.clone());
              });

            return response;
          }
        );
      })
    );
});

// Specify the cookie changes we're interested in during the install event.
self.addEventListener('install', (event) => {
  event.waitUntil(
    cookieStore.subscribeToChanges([{ name: 'session_id' }])
  );
});

// Delete cached data when the user logs out.
self.addEventListener('cookiechange', (event) => {
  for (const cookie of event.deleted) {
    if (cookie.name === 'session_id') {
      indexedDB.deleteDatabase('user_cache');
      break;
    }
  }
});