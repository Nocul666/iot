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
    /*
        logArray.push(logEvent);
        _place.value = "";

        console.log('logEvent', logEvent)
        localStorage.setItem(_action, logArray);
        const newVal = localStorage.getItem(_action);
        console.log(newVal + "to to ");
    */
    //<---------- TAK TO TAM DZIAŁA ALE JEST COŚLEPSZEGO DO PRZETESTOWANIA 
    localStorage.setItem(_action, JSON.stringify(logEvent));
    let storageObject = JSON.parse(localStorage.getItem(_action));
    console.log(storageObject.action);
    console.log(storageObject.place);
    console.log(storageObject.date);

    class kingsPage {
        constructor() {
            this.button = document.querySelector('#form-button');
        }
    
        init() {
            this.initializeIndexedDb();
            this.registerServiceWorker();
        }
    
        initializeIndexedDb() {
            let messageToKing = window.indexedDB.open('messageDb');
            
            messageToKing.onupgradeneeded = (event) => {
                let db = event.target.result;
                let messageObjStore = db.createObjectStore('messageObjStore', { autoIncrement: true });
                
                messageObjStore.createIndex('name', 'name', { unique: false });
                messageObjStore.createIndex('army', 'army', { unique: false });
                messageObjStore.createIndex('message', 'message', { unique: true });
                messageObjStore.createIndex('dateAdded', 'dateAdded', { unique: true });
            }
        }
    
        getFormData() {
            return {
                name: document.querySelector('#formName').value,
                army: document.getElementById('#formArmy').value,
                message: document.getElementById('#formMessage').value,
                dateAdded: new Date()
            };
        }
    
        formDataToDb() {
            return new Promise((resolve, reject) => {
                let messageToKing = window.indexedDB.open('messageDb');
    
                messageToKing.onsuccess = event => {
                    let objStore = messageToKing.result.transaction('messageObjStore', 'readwrite')
                    .objectStore('messageObjStore');
                    objStore.add(this.getFormData());
                    resolve();
                }
    
                messageToKing.onerror = err => {
                    reject(err);
                }
            });
        }
    
        formDataToServer() {
            return fetch('your server url', {
                method: 'POST',
                body: JSON.stringify(this.getFormData()),
                headers:{
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                console.log('Wiadomośc wysłana');
            }).catch((err) => {
                console.log(`Wystąpił błąd: ${err}`);
            })
        }
    
        registerServiceWorker() {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                    if (registrations.length === 0) {
                        navigator.serviceWorker.register('serviceWorker.js');
                    }})
                .then(() => {
                    return navigator.serviceWorker.ready;
                })
                .then(registration => {
                    this.button.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.formDataToDb().then(function() {
                        if(registration.sync) {
                            registration.sync.register('message-to-king')
                            .catch(function(err) {
                                return err;
                                })
                            }
                        });
                    })
                })
            } else {
                this.button.addEventListener('click', () => {
                    this.formDataToServer();
                });
            }
        }
    }
    
    const coreJs = new kingsPage();
    
    window.addEventListener('load', () => {
        coreJs.init();
    });

    self.onsync = event => {
        if(event.tag === 'message-to-king') {
            event.waitUntil(synchronize());
        }
    }
    
    function getDataFromDb () {
        return new Promise((resolve, reject) => {
            let db = indexedDB.open('messageDb');
            db.onsuccess = () => {
                db.result.transaction('messageObjStore').objectStore('messageObjStore').getAll()
                .onsuccess = event => {
                    resolve(event.target.result);
                }
            }
            db.onerror = err => {
                reject(err);
            }
        });
    }
    
    function sendToServer(response) {
        return fetch('your server address', {
            method: 'POST',
            body: JSON.stringify(response),
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .catch(err => {
            return err;
        });
    }
    
    function synchronize() {
        return getDataFromDb()
        .then(sendToServer)
        .catch(function(err) {
            return err;
        });
    }
}