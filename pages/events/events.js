class EventsAdmin {
    /**
     * Make a request to get list of all events
     * @returns {void}
     */
    eventsList() {
        axios.post('/admin/events/get-events')
            .then((response) => {
                if (response.data.length == 0) {
                    return;
                }

                return this.#leafletAdminMap('map', response.data)
            })
            .catch((error) => {
                return console.error(error);
            });
    }

    /**
     * Creation of a map with all events
     * @param {element} element Map placement
     * @param {object} data Event list
     * @returns {void}
     */
    #leafletAdminMap(element = 'map', data) {
        let map = L.map(element, { maxZoom: 18 }).setView([0, 0], 1);
        let markers = L.markerClusterGroup({ spiderfyOnMaxZoom: false, disableClusteringAtZoom: 12 });
        let latLong = Array();
        let marker;

        data.forEach(event => {
            latLong.push([event.latitude, event.longitude]);
            
            marker = L.marker(new L.LatLng(event.latitude, event.longitude))
                .bindPopup(`
                    <b>Nom :</b> ${event.name}
                    <br>
                    <b>Participants :</b> ${event.attendees}
                    <br>
                    <b>Organisateur :</b> ${event.email}
                    <br>
                    <b>Date :</b> ${event.date} à ${event.time}
                    <br>
                    <b>Durée :</b> ${event.duration} minutes
                `);
            
            markers.addLayer(marker);
        });

        map.addLayer(markers);

        let averageLatLong = new L.LatLngBounds(latLong);
        map.fitBounds(averageLatLong);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }

    /**
     * Init of the delete buttons for events
     * @returns {void}
     */
    deleteEvent() {
        const deleteButtons = document.getElementsByClassName('btn-delete-event');
        const confirmDeleteEvent = document.getElementById('confirmDeleteEvent');
        
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (e) => {
                let idEvent = e.currentTarget.dataset.event;

                let confirmDeleteEventModal = new bootstrap.Modal(confirmDeleteEvent);
                confirmDeleteEventModal.show();
                confirmDeleteEventModal['_element'].querySelector('form').action = `/admin/events/${idEvent}/delete-event`;
            });
        }
    }
}
