var cachedData;
var map;

var invitationAccepted = new Audio("/sounds/Invitation Accepted.mp3");

$(document).ready(function() {

    resizeMap();

    initMap();

    invitationAccepted.play();

    $('select#day').change(function() {
        sendToMapByDate(cachedData);
    });

    $.ajax({
        type: "POST",
        url: "/dailyPosition",
        dataType: 'text',
        success: function(data, textStatus, jqXHR){
            
            // contains ALL data.
            cachedData = JSON.parse(data);
            sendToMapByDate(cachedData);
        },
        error: function(data, textStatus, jqXHR){
            alert("FAIL: " + data);
        }
    });
});

function sendToMapByDate(data) {

    var dayToView = $('select#day').find(":selected").text();

    $.each(data, function(index, value) {
        if(value.date == dayToView){
            sendJsonToMap(value.data);
            return false;
        }
    });
}

function sendJsonToMap(geoJson) {

    // Valid JSON
    var coordinates = [];

    for(i = 0; i < geoJson.length; i++){
        singleCoord = geoJson[i];
        coordinates.push([singleCoord.lat, singleCoord.lon]);
    }

    var lastCoord = coordinates[coordinates.length - 1];

    map.removePolylines();

    // Path
    map.drawPolyline({
        path: coordinates,
        strokeColor: '#131540',
        strokeOpacity: 0.6,
        strokeWeight: 6
    });
}

function initMap() {
    map = new GMaps({
        div: '#map',
        lat: 30.092090,
        lng: -95.385285,
    });

    map.setZoom(11);

    // Home
    map.addMarker({
        lat: 30.092090,
        lng: -95.385285,
        title: 'Home'
    });

    // Work
    map.addMarker({
        lat: 29.754700,
        lng: -95.371150,
        title: 'Work'
    });
}

$(window).resize(function() {
    resizeMap();
});

function resizeMap(){
    var scrollTop     = $(window).scrollTop(),
    elementOffset = $('#map').offset().top,
    distance      = (elementOffset - scrollTop);

    $("#map").css("height", $(window).height() - elementOffset - 50);
}
