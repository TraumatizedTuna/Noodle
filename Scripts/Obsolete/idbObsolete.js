	var request = indexedDB.open(dbName);
	request.onerror = function (event) {
		err = event.error;
	};
	request.onsuccess = function (event) {
		alert('Yeahz');
	};


	request.onupgradeneeded = function (event) {
		alert("Upgrade needed");
		// Save the IDBDatabase interface 
		core.data.db = db = event.target.result;

		// Create an objectStore for this database
		var store = db.createObjectStore(storeName, {});
		store.transaction.oncomplete = function (e) {

			var transaction = db.transaction([storeName], 'readwrite');
			transaction.oncomplete = function (event) {
				alert("Write done");
			};
			transaction.onerror = function (event) {
				// Don't forget to handle errors!
			};
			var store = transaction.objectStore(storeName);
			var reqAdd = store.add(val, key);
			reqAdd.onsuccess = function (e) {
				alert(e.target.result);
			};
		};
};