class EventManager {
    /**
     * Add event for deleting for users from an event
     * @returns {void}
     */
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

    /**
     * Event for regenerate the event code
     * @returns {void}
     */
    regenerateEventCodeButton(idEvent) {
        const regenerateCodeButton = document.getElementsByClassName('btn-regenerate-codee');
        const regenerateCode = document.getElementById('regenerateCode');
        
        for (let i = 0; i < regenerateCodeButton.length; i++) {
            regenerateCodeButton[i].addEventListener('click', (e) => {
                let regenerateCodeModal = new bootstrap.Modal(regenerateCode);
                regenerateCodeModal.show();
                regenerateCodeModal['_element'].querySelector('form').action = `/app/event/${idEvent}/regenerate-code`;
            });
        }
    }

    /**
     * Leave function confirmation
     * @param {number} idEvent ID of the event
     * @returns {void}
     */
    leaveEventButton(idEvent) {
        const leaveButton = document.getElementsByClassName('btn-leave');
        const leaveEvent = document.getElementById('leaveEvent');
        
        for (let i = 0; i < leaveButton.length; i++) {
            leaveButton[i].addEventListener('click', (e) => {
                let leaveEventModal = new bootstrap.Modal(leaveEvent);
                leaveEventModal.show();
                leaveEventModal['_element'].querySelector('form').action = `/app/event/${idEvent}/leave-event`;
            });
        }
    }

    /**
     * Init of the deletion button of an event
     * @param {number} idEvent ID of the event
     * @returns {void}
     */
    deleteEventButton(idEvent) {
        const deleteButton = document.getElementsByClassName('btn-delete-event');
        const deleteEvent = document.getElementById('deleteEvent');
        
        for (let i = 0; i < deleteButton.length; i++) {
            deleteButton[i].addEventListener('click', (e) => {
                let leaveEventModal = new bootstrap.Modal(deleteEvent);
                leaveEventModal.show();
                leaveEventModal['_element'].querySelector('form').action = `/app/event/${idEvent}/delete-event`;
            });
        }
    }

    /**
     * Init of the add to shopping list button of an event
     * @param {number} idEvent ID of the event
     * @returns {void}
     */
    addShoppingListItemButton(idEvent) {
        const addArticleButton = document.getElementsByClassName('btn-add-article');
        const addArticle = document.getElementById('addArticle');
        
        for (let i = 0; i < addArticleButton.length; i++) {
            addArticleButton[i].addEventListener('click', (e) => {
                let addArticleModal = new bootstrap.Modal(addArticle);
                addArticleModal.show();
                addArticleModal['_element'].querySelector('form').action = `/app/event/${idEvent}/add-article`;
            });
        }
    }

    /**
     * Init of the input for inviting multiple
     * people
     * @returns {void}
     */
    invitePeople() {
        new TomSelect('#input-tags-emails', {
            persist: false,
            createOnBlur: true,
            create: true,
            render: {
                no_results: function() {
                    return;
                },
                option_create: function(data, escape) {
                    return `
                        <div class="create">Ajouter <strong>${escape(data.input)}</strong>&hellip;</div>
                    `;
                }
            }
        });
    }

    addSongToPlaylist() {
        new TomSelect('#input-tags-songs', {
            valueField: 'uri',
            labelField: 'name',
            searchField: ['name', 'artists'],
            // maxItems: 1,
            create: true,
            closeAfterSelect: true,
            load: function(query, callback) {
                var url = `/api/search-songs?q=${encodeURIComponent(query)}`;
                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        callback(json);
                    }).catch(() => {
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
                                        ${escape(item.name)} - ${escape(item.artists)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                },
                item: function(item, escape) {
                    return `
                        <div class="py-0 d-flex">
                            <div>
                                <div class="mb-1">
                                    <span>
                                        ${escape(item.name)} - ${escape(item.artists)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                },
                no_results: function() {
                    return `<div class="no-results">Pas de titres trouvés</div>`;
                },
                option_create: function(data, escape) {
                    return;
                }
            },
        });
    }

    selectTab() {
        let hash = location.hash;

        switch (hash) {
            case '#attendees':
                document.getElementById('attendeesTab').click();
                break;
            case '#chat':
                document.getElementById('chatTab').click();
                break;
            case '#location':
                document.getElementById('locationTab').click();
                break;
            case '#shopping-list':
                document.getElementById('shoppingTab').click();
                break;
            case '#playlist':
                document.getElementById('playlistTab').click();
                break;
            case '#event':
                document.getElementById('eventTab').click();
                break;
        }

        const tabButtons = document.getElementsByClassName('tabButton');
        
        for (let i = 0; i < tabButtons.length; i++) {
            tabButtons[i].addEventListener('click', () => {
                let btnHash = tabButtons[i].attributes.href.nodeValue;
                let stateObj = { hash: btnHash };

                window.history.pushState(stateObj, '', `${location.pathname}${btnHash}`);
            });
        }
    }
}
