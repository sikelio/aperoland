class Users {
    init() {
        this.#deleteButtons();
    }

    /**
     * Create interaction of deletation of users
     */
    #deleteButtons() {
        const deleteButtons = document.getElementsByClassName('btn-delete');
        const confirmDeleteUser = document.getElementById('confirmDeleteUser');
        
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', (e) => {
                let idUser;
                let username;

                switch (e.target.nodeName) {
                    case 'BUTTON':
                        idUser = e.target.dataset.user;
                        username = e.target.parentElement.parentElement.querySelector('.username').innerHTML;
                        break;
                    case 'I':
                        idUser = e.target.parentElement.dataset.user;
                        username = e.target.parentElement.parentElement.parentElement.querySelector('.username').innerHTML;
                        break;
                    default:
                        return;
                        break;
                }

                let confirmDeleteUserModal = new bootstrap.Modal(confirmDeleteUser);
                confirmDeleteUserModal.show();
                confirmDeleteUserModal['_element'].querySelector('#deletedUser').innerHTML = username;
                confirmDeleteUserModal['_element'].querySelector('#idUser').value = idUser;
            });
        }
    }
}
