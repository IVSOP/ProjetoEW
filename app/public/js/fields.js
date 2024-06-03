import { houseTemplate } from "./templates.js";
import { dateTemplate } from "./templates.js";
import { placeTemplate } from "./templates.js";
import { entityTemplate } from "./templates.js";
import { oldImageTemplate } from "./templates.js";
import { newImageTemplate } from "./templates.js";


$(document).ready(function(){

    var lastHouseId = ($('#housesContainer .card').length);
    var lastDateId = ($('#datesContainer .row').length);
    var lastPlaceId = ($('#placesContainer .row').length);
    var lastEntityId = ($('#entitiesContainer .row').length);
    var lastOldImageId = ($('#oldImagesContainer .row').length);
    var lastNewImageId = ($('#newImagesContainer .row').length);


    function addField(container,fieldTemplate,id) {
        var newField = fieldTemplate.replace(/__ID__/g,id);
        container.append(newField);
    }


    $('#addDate').click(function(){
        lastDateId++;
        console.log(lastDateId)
        addField($("#datesContainer"),dateTemplate,`date${lastDateId}`);
    });


    $('#addPlace').click(function(){
        lastPlaceId++;
        addField($("#placesContainer"),placeTemplate,`place${lastPlaceId}`);
    });


    $('#addEntity').click(function(){
        lastEntityId++;
        addField($("#entitiesContainer"),entityTemplate,`entity${lastEntityId}`);
    });


    $('#addHouse').click(function(){
        lastHouseId++;
        addField($("#housesContainer"),houseTemplate,`house${lastHouseId}`);
    });


    $('#addOldImage').click(function(){
        lastOldImageId++;
        addField($("#oldImagesContainer"),oldImageTemplate,`oldImage${lastOldImageId}`);
    });


    $('#addNewImage').click(function(){
        lastNewImageId++;
        addField($("#newImagesContainer"),newImageTemplate,`newImage${lastNewImageId}`);
    });


    $('#datesContainer').on('click', '.deleteDate', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#placesContainer').on('click', '.deletePlace', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#entitiesContainer').on('click', '.deleteEntity', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#housesContainer').on('click', '.deleteHouse', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#oldImagesContainer').on('click', '.deleteOldImage', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });


    $('#newImagesContainer').on('click', '.deleteNewImage', function() {
        var fieldId = $(this).data('field-id');
        $('#' + fieldId).remove();
    });
});