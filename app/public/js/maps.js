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
        const mapContainer = $('.map-content');

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
            zoom: 15,
            antialias: true
        });

        //add zoom in/out, rotate controls
        map.addControl(new mapboxgl.NavigationControl());
        
        //Draw 3D layer
        map.on('style.load', () => {
            const layers = map.getStyle().layers;
            const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;

            map.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
            );
        });

        var marker = new mapboxgl.Marker()
            .setLngLat([street.geoCords.longitude, street.geoCords.latitude])
            .addTo(map);

        const popupContent = `
            <div style="text-align: center; vertical-align: middle; line-height: 15px; padding: 5px">
              <span><b>${street.name}<b></span>
            </div>
        `;

        let popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        }).setHTML(popupContent);

        marker.setPopup(popup);

        //mostrar popup quando user sobrevoa marker
      $(marker.getElement()).on('mouseenter', function() {
        popup.addTo(map);
      });

      //retirar popup quando user deixa de sobrevoar marker
      $(marker.getElement()).on('mouseleave', function() {
        popup.remove();
      });

      //centrar mapa em marker quando utilizador clica em marcador,e mostrar popup
      $(marker.getElement()).on('click', function() {
        map.flyTo({
          center: [street.geoCords.longitude, street.geoCords.latitude],
          zoom: 15
        });
      });

        // switch between styles
      $(document).ready(function() {
        $('#menu input[type=radio]').on('click', function() {
          const layerId = $(this).attr('id');
          map.setStyle('mapbox://styles/mapbox/' + layerId);
        });
      });

      // toggle 3D angle
      let is3D = false;
      $('#toggle-3d').on('click', function() {
        if (!is3D) {
          map.setPitch(60);
            
        } else {
          map.setPitch(0);
        }
        is3D = !is3D;
      });

    }
})