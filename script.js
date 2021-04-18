var enterBtn = document.getElementById('enterBtn');
var parkBtn = document.getElementById('parkBtn');
var parkInput = document.getElementById('parkInput');
var leaveBtn = document.getElementById('leaveBtn');
var leaveInput = document.getElementById('leaveInput');

var logArray = [];

enterBtn.addEventListener('click', function() {
    logAction('Wjazd', 0);
});
parkBtn.addEventListener('click', function() {
    logAction('Parkowanie', parkInput);
});
leaveBtn.addEventListener('click', function() {
    logAction('Opuszczanie', leaveInput);
});

function logAction(_action, _place) {
    var date = new Date();

    var logEvent = {
        action: _action,
        place: _place.value,
        date: date
    };
    localStorage.setItem(_action, JSON.stringify(logEvent));
    let storageObject = JSON.parse(localStorage.getItem(_action));
    console.log(storageObject.action);
    console.log(storageObject.place);
    console.log(storageObject.date);
  
//     cookieStore.get('session_id')
//     cookieStore.set({ name: storageObject.action, value: storageObject.place });
 }

// cookieStore.addEventListener('change', (event) => {
//     for (const cookie of event.changed) {
//       if (cookie.name === 'session_id')
//         sessionCookieChanged(cookie.value);
//     }
//     for (const cookie of event.deleted) {
//       if (cookie.name === 'session_id')
//         sessionCookieChanged(null);
//     }
//   });

