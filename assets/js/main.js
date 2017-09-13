//validacion username 
function validateForm() {
    var x = document.getElementById("name").value;
    if (x == "") {
        alert("Name must be filled out");
        return false;
    }
}





// MAIN JS seccion geolocalizacion mapa
const app = {
    
    settings : {
        map: undefined,
        serviceDirection: undefined,
        sourcePosition: undefined,
        direction: undefined,
        destinationPosition: undefined
        
    },

    init : function() {
        //Inicialización del mapa
        app.settings.map = new google.maps.Map($("#map")[0], {
            zoom: 5,
            center: {
                lat: -9.1191427, 
                lng: -77.0349046
            },
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });
  
        app.settings.sourcePosition = $('#origen')[0];
        app.autocompletePosition(app.settings.sourcePosition);
        app.settings.destinationPosition = $('#destino')[0];
        app.autocompletePosition(app.settings.destinationPosition);
        
        app.settings.serviceDirection = new google.maps.DirectionsService;
        app.settings.direction = new google.maps.DirectionsRenderer;
        app.settings.direction.setMap(app.settings.map);
        app.setup();
    },

    setup : function () {
        $("#encuentrame").click(app.find);
        $("#destino").click(function(){
        	app.find();
            // app.drawRoad(app.settings.serviceDirection, app.settings.direction)
        });
    },

    /*funcion que encuentra mi ubicacion*/
    find : function () {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(app.markerPosition,app.funcionError);
        }
    },
    //funcion markerPosition
    markerPosition : function(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        let location = new google.maps.InfoWindow();
        let marker = app.createMarker(app.settings.map);

        marker.setPosition(new google.maps.LatLng(latitude,longitude));
        app.settings.map.setCenter({
            lat:latitude,
            lng:longitude
        });
        app.settings.map.setZoom(17); 
        marker.setVisible(true);

        location.setContent('<div><strong>Mi ubicación actual</strong><br>');
        location.open(app.settings.map, marker);
    },
    //funcion Error
    funcionError : function(error) {
        alert("Tenemos un problema para encontrar tu ubicación");
    },

    //funcion que autocompleta las direcciones en los input origen y destino.
    autocompletePosition : function (input) {
        let autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', app.settings.map);
        let location = new google.maps.InfoWindow();
        let marker = app.createMarker(app.settings.map);
            autocomplete.addListener('place_changed', function() {
            location.close();
            marker.setVisible(false);
        let place = autocomplete.getPlace();
            app.Location(place, location, marker);
        });
    },

    createMarker : function (map) {
        let icon = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origen: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icon,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },

    //funcion que crea la nota de la ubicacion.
    Location : function(place, location, marker) {
        if (!place.geometry) {
            window.alert("No encontramos el lugar que indicaste: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            app.settings.map.fitBounds(place.geometry.viewport);
        } else {
            app.settings.map.setCenter(place.geometry.location);
            app.settings.map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        location.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        location.open(app.settings.map, marker);
    },

    //Funcion que dibuja la ruta
    drawRoad : function(serviceDirection, direction) {
        let origen = $("#origen").val();
        let destino = $('#destino').val();

        if(destino != "" && origen != "") {
            serviceDirection.route({
                origen: origen,
                destino: destino,
                travelMode: "DRIVING"
            },
            function(response, status) {
                if (status === "OK") {
                    direction.setDirections(response);
                } else {
                    app.error();
                }
            });
        }
    },

    error : function() {
        alert("No ingresaste un origen y un destino validos");
    }  
}    

function initMap(){
    app.init();
}