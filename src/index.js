function activeStation() {
   let ul = document.getElementById('list');
   ul.innerHTML = '';
   fetch("http://localhost:3000/stations")
      .then(res => {
         if (!res.ok) throw new Error(res.status)
         return res.json();
      })
      .then((data) => {
         data.forEach(station => {
            if (station.status) {
               const li = document.createElement('li');
               li.textContent = `ID: ${station.id}, Address: ${station.address}`;
               ul.appendChild(li);
            }
         });
      })
      .catch(error => console.error('Error fetching stations:', error));
}

function inactiveStation() {
   let ul = document.getElementById('list');
   ul.innerHTML = '';
   fetch("http://localhost:3000/stations")
      .then(res => {
         if (!res.ok) throw new Error(res.status)
         return res.json();
      })
      .then((data) => {
         data.forEach(station => {
            if (!station.status) {
               const li = document.createElement('li');
               li.textContent = `ID: ${station.id}, Address: ${station.address}`;
               ul.appendChild(li);
            }
         });
      })
      .catch(error => console.error('Error fetching stations:', error));
}

function addStation() {
   let inputAddress = document.getElementById("address"),
      selectElement = document.getElementById("status"),
      selectedValue = selectElement.value,
      inputAddressValue = inputAddress.value;

   const newStation = {
      address: inputAddressValue,
      status: selectedValue === "true" ? true : false
   };

   fetch("http://localhost:3000/stations", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(newStation)
   })
      .then(res => {
         if (!res.ok) throw new Error(res.status);
         return res.json();
      })
      .then(data => {
         console.log("Нова станція успішно додана:", data);
      })
      .catch(error => {
         console.error("Помилка при додаванні нової станції:", error);
      });
}

window.activeStation = activeStation;
window.inactiveStation = inactiveStation;
window.addStation = addStation;