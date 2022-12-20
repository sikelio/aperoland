class App {
    init(element) {
        this.#modalsSelect(element);
    }

    #modalsSelect(element) {
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
}