class App {
    init() {
        // this.#modalsSelect();
    }

    #modalsSelect() {
        new TomSelect('#address',{
            valueField: 'url',
            labelField: 'name',
            searchField: 'name',
            load: function(query, callback) {
                var url = '/api/geocode?q=' + encodeURIComponent(query);
                axios.get(url)
                    .then(response => response.json())
                    .then(json => {
                        callback(json.items);
                    }).catch(() => {
                        callback();
                    });
            },
            render: {
                option: function(item, escape) {
                    return `
                        <div class="py-2 d-flex">
                            <div class="icon me-3">
                                <img class="img-fluid" src="${item.owner.avatar_url}"/>
                            </div>
                            <div>
                                <div class="mb-1">
                                    <span class="h4">
                                        ${escape(item.name)}
                                    </span>
                                    <span class="text-muted">by ${escape(item.owner.login)}</span>
                                </div>
                                <div class="description">${escape(item.description)}</div>
                            </div>
                        </div>
                    `;
                },
                item: function(item, escape) {
                    console.error(item);
                    return `
                        <div class="py-2 d-flex">
                            <div class="icon me-3">
                                <img class="img-fluid" src="${item.owner.avatar_url}"/>
                            </div>
                            <div>
                                <div class="mb-1">
                                    <span class="h4">
                                        ${escape(item.name)}
                                    </span>
                                    <span class="text-muted">by ${escape(item.owner.login)}</span>
                                </div>
                                <div class="description">${escape(item.description)}</div>
                            </div>
                        </div>
                    `;
                }
            },
        });
    }
}