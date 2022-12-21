class App {
    modalsSelect(element) {
        new TomSelect(element, {
            valueField: 'label',
            labelField: 'label',
            searchField: 'label',
            maxItems: 1,
            onItemAdd: (value, item) => {
                this.#addressCallback(value, item)
            },
            closeAfterSelect: true,
            load: function(query, callback) {
                var url = '/api/geocode?q=' + encodeURIComponent(query);
                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        callback(json);
                    }).catch(()=>{
                        callback();
                    });
            },
            render: {
                option: function(item, escape) {
                    return `
                        <div class="py-2 d-flex">
                            <div>
                                <div class="mb-1">
                                    <span>
                                        ${escape(item.label)}
                                    </span>
                                    <span id="lat" class="d-none">${escape(item.coordinates[0])}</span>
                                    <span id="long" class="d-none">${escape(item.coordinates[1])}</span>
                                </div>
                            </div>
                        </div>
                    `;
                },
                item: function(item, escape) {
                    return `
                        <div class="py-2 d-flex">
                            <div>
                                <div class="mb-1">
                                    <span>
                                        ${escape(item.label)}
                                    </span>
                                    <span id="lat" class="d-none">${escape(item.coordinates[0])}</span>
                                    <span id="long" class="d-none">${escape(item.coordinates[1])}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
        });
    }

    #addressCallback(value, item) {
        document.getElementById('latitude').value = item.querySelectorAll('#lat')[0].innerText;
        document.getElementById('longitude').value = item.querySelectorAll('#long')[0].innerText;
    }

    leafletMap(element = 'map', latitude, longitude, eventName = '') {
        var map = L.map(element).setView([latitude, longitude], 15);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.marker(new L.LatLng(latitude, longitude))
            .addTo(map)
            .bindPopup(eventName);
    }
}