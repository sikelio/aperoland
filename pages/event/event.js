class EventManager {
    deleteUserButton() {
        const deleteButtons = document.getElementsByClassName('btn-delete');
        const deleteUser = document.getElementById('deleteUser');
        
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (e) => {
                let idUser = e.currentTarget.dataset.user;
                let idEvent = e.currentTarget.dataset.event;
                let username = e.currentTarget.parentElement.parentElement.querySelector('.username').innerHTML;

                let deleteUserModal = new bootstrap.Modal(deleteUser);
                deleteUserModal.show();
                deleteUserModal['_element'].querySelector('#deletedUser').innerHTML = username;
                deleteUserModal['_element'].querySelector('#idUser').value = idUser;
                deleteUserModal['_element'].querySelector('#idEvent').value = idEvent;
            });
        }
    }

    /**
     * Request of the event data
     * @param {number} idEvent ID of the event
     * @returns {void}
     */
    editEventButton(idEvent) {
        var url = `/app/event/${idEvent}/edit-event`;

        const editButton = document.getElementById('editEventBtn');
        editButton.addEventListener('click', (e) => {
            axios.post(url)
                .then((response) => {
                    this.#fillEditModal(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }

    /**
     * Fill the modal input with event data
     * @param {object} data Event data
     * @returns {void}
     */
    #fillEditModal(data) {
        const editEventModalLocation = document.getElementById('editEvent');
        let editEventModal = new bootstrap.Modal(editEventModalLocation);
        editEventModal.show();
        editEventModal['_element'].querySelector('form').action = `/app/event/${data.idEvent}/edit-event/save`

        Object.entries(data).forEach((key) => {
            if (editEventModal['_element'].querySelector(`#${key[0]}`)) {
                editEventModal['_element'].querySelector(`#${key[0]}`).value = key[1];
            }
        });
    }

    /**
     * Event for copy the event code
     * @returns {void}
     */
    copyEventCodeButton() {
        const btn = document.getElementById('copyEventCode');
        const uuid = document.getElementById('uuid');

        btn.addEventListener('click', (e) => {
            navigator.clipboard.writeText(uuid.textContent);
        });
    }
}
