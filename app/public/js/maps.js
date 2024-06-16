$(document).ready(function() {
    //fetch automatico de coordenadas
    ($('#generate-geo-cords')).on('click', function() {

        const ruaSearch = $('#rua-search').val()
        const geoError = $('#geo-error');
        const lngField = $('#lng-field');
        const latField = $('#lat-field')

        geoError.addClass('d-none')

        if (ruaSearch.trim() === "") {
            geoError.text('Por favor, insira um endereço de pesquisa').removeClass('d-none')
            return
        }

        const accessToken = 'pk.eyJ1IjoicHJvamV3MjAyNCIsImEiOiJjbHhmYmFtZDEwaXB2MmlxcHRxZWh6NmkyIn0.u-B3ZAgVigR30lMTX7UgvQ';
        const base_url = `https://api.mapbox.com/search/geocode/v6/forward?&country=pt&limit=3&types=street&language=pt&access_token=${accessToken}`
        const url = `${base_url}&q=${encodeURI(ruaSearch)}%2C%20Braga%2C%20Portugal`

        //fetch url in jquery
        $.getJSON(url, function(data) {
            if (data.features && data.features.length > 0) {
                const [longitude, latitude] = data.features[0]['geometry']['coordinates']
                lngField.val(longitude);
                latField.val(latitude);

                $('#preview-map').click();
            } else {
                geoError.text('Nenhum resultado encontrado.').removeClass('d-none');
            }
        }).fail(function() {
            console.log('Error fetching geocoding data');
            geoError.text('Erro ao buscar dados de geocodificação.').removeClass('d-none');
        });
    })

    //gerar mapa com mapbox para coordenadas dadas
    $('#preview-map').on('click', function() {
        const lng = $('#lng-field').val();
        const lat = $('#lat-field').val();
        const mapError = $('#map-preview-error');
        const mapContainer = $('#map-preview');

        mapError.addClass('d-none');

        if (!lng || !lat) {
            mapError.text('Por favor, preencha os campos de longitude e latitude primeiro.').removeClass('d-none');
            return;
        }

        const street = {
            name: 'Localização Selecionada',
            geoCords: {
                longitude: parseFloat(lng),
                latitude: parseFloat(lat)
            }
        };

        mapContainer.removeClass('d-none');
        loadMap(street);
    });

    function loadMap(street) {
        mapboxgl.accessToken = 'pk.eyJ1IjoicHJvamV3MjAyNCIsImEiOiJjbHhmYmFtZDEwaXB2MmlxcHRxZWh6NmkyIn0.u-B3ZAgVigR30lMTX7UgvQ';
        
        var map = new mapboxgl.Map({
            container: 'map-preview',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [street.geoCords.longitude, street.geoCords.latitude],
            zoom: 15
        });

        var marker = new mapboxgl.Marker()
            .setLngLat([street.geoCords.longitude, street.geoCords.latitude])
            .addTo(map);

        const popupContent = `
            <div>
                <p><b>${street.name}<b></p>
            </div>
        `;

        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        }).setHTML(popupContent);

        marker.getElement().addEventListener('mouseenter', () => {
            popup.addTo(map);
        });

        marker.getElement().addEventListener('mouseleave', () => {
            popup.remove();
        });

        marker.setPopup(popup);
    }
})