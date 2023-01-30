class Users {
    init() {
        this.#deleteButtons();
    }

    /**
     * Create interaction of deletation of users
     * @returns {void}
     */
    #deleteButtons() {
        const deleteButtons = document.getElementsByClassName('btn-delete');
        const confirmDeleteUser = document.getElementById('confirmDeleteUser');
        
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (e) => {
                let idUser = e.currentTarget.dataset.user;
                let username = e.currentTarget.parentElement.parentElement.querySelector('.username').innerHTML;

                let confirmDeleteUserModal = new bootstrap.Modal(confirmDeleteUser);
                confirmDeleteUserModal.show();
                confirmDeleteUserModal['_element'].querySelector('#deletedUser').innerHTML = username;
                confirmDeleteUserModal['_element'].querySelector('#idUser').value = idUser;
            });
        }
    }
}
