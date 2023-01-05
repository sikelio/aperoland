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

    editEventButton(idEvent) {
        const editEventModal = '';

        var url = `/app/event/${idEvent}/edit-event`;

        const editButton = document.getElementById('editEvent');
        editButton.addEventListener('click', (e) => {
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    console.error(json);
                }).catch(() => {
                    console.error();
                });
        });
    }
}
