var transferComplete = new Audio("/sounds/File Transfer Complete.mp3");

$('#location_gallery').fileupload({
    dataType:'json',
    url:'/upload',
    autoUpload: true,
    sequentialUploads:true,
    singleFileUploads: false,
    imageCrop: true,
    // acceptFileTypes:/(\.|\/)(gif|jpe?g|png|txt|doc|docx|xml|xls|xlsx)$/i,
    acceptFileTypes:/(.*)/,
    process:[
        {
            action:'load',
            fileTypes:/^image\/(gif|jpeg|png)$/,
            maxFileSize: 20000000 // 20MB
        },
        // {
        //     action:'resize',
        //     maxWidth:1200,
        //     maxHeight:800
        // },
        {
            action:'save'
        }
    ],
    dropZone: $('#gallery_dropzone'),
    progressall:function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#gallery_progress .bar').css('width', progress + '%');
    },
    filesContainer:$('#upload_gallery_files'),
    uploadTemplate:function (o) {
        var rows = $();
        $.each(o.files, function (index, file) {
            var row = $('<li class="template-upload">' +
                '<div class="outer"><div class="preview"><span class="fade"></span></div>' +
                '<span class="cancel"><button class="btn btn-small btn-danger" type="button">Delete</button></span>' +
                '<span class="name"></span>' +
                '<span class="size"></span>' +
                (file.error ? '<span class="error">Error</span>' :
                    '<p><div class="progress">' +
                        '<div class="bar" style="width:0%;"></div></div></p>' +
                        '<span class="start"><button class="btn btn-small btn-success" type="button">Send</button></span>') +
                '</div></li>');
            row.find('.name').text(file.name);
            row.find('.size').text(o.formatFileSize(file.size));
            if (file.error) {
                row.find('.error').text(file.error || 'File upload error');
            }
            rows = rows.add(row);
            $('#upload_gallery_files').append(row);
        });
        return rows;
    },
    downloadTemplate: function (o) {
        var rows = $();
        $.each(o.files, function (index, file) {
            var row = $('<li class="template-download">' +
                '<div class="outer">' +
                (file.error ? '<span class="name"></span>' +
                    '<span class="size"></span><span class="error"></span>' :
                    '<div class="preview"></div>' +
                        '<span class="name"><a></a></span>' +
                        ' [<span class="size"></span>]') +
                '<span class="delete"><button class="btn btn-small btn-danger" type="button">Delete</button></span></div></li>');
            row.find('.size').text(o.formatFileSize(file.size));
            if (file.error) {
                row.find('.name').text(file.name);
                row.find('.error').text(file.error || 'File upload error');
            } else {
                row.find('.name a').text(file.name);
                if (file.url) {
                    row.find('.preview').append('<a><img></a>')
                        .find('img').prop('src', file.smallUrl);
                    row.find('a').prop('rel', 'gallery');
                }
                row.find('a').prop('href', file.url);
                row.find('.delete')
                    .attr('data-type', file.delete_type)
                    .attr('data-url', file.deleteUrl);
                // add file data input
                row.append('<input type="hidden" name="galleryImage[]">')
                    .find('input[name="galleryImage[]"]').val(file.name);
                row.find('img').data('fileinfo',file);
            }
            rows = rows.add(row);
            $('#upload_gallery_files').append(row);
        });
        return rows;
    }
}).bind('fileuploaddone', function (e, data) {transferComplete.play();});

$(document).ready(function (){
    
    getFiles("upload/list");
});

function getFiles(url) {
    
    $.ajax({
        url: url,
        type: "get",
        success: function(data){
            
            //alert(data);
            appendFilesToView(data);
        },
        error:function(data, generalError, textStatus){
            alert("Couldn't get the list of files: " + textStatus);
        }
    });
}

function appendFilesToView(o){
    
    // var rows = $();
    $.each(JSON.parse(o).files, function (index, file) {
        var row = $('<li class="template-download">' +
            '<div class="outer">' +
            (file.error ? '<span class="name"></span>' +
                '<span class="size"></span><span class="error"></span>' :
                '<div class="preview"></div>' +
                    '<span class="name"><a></a></span>' +
                    ' [<span class="size"></span>]') +
            '<span class="delete"><button class="btn btn-small btn-danger" type="button">Delete</button></span></div></li>');
        row.find('.size').text(file.size);
        if (file.error) {
            row.find('.name').text(file.name);
            row.find('.error').text(file.error || 'File upload error');
        } else {
            row.find('.name a').text(file.name);
            if (file.url) {
                row.find('.preview').append('<a><img></a>')
                    .find('img').prop('src', file.smallUrl);
                row.find('a').prop('rel', 'gallery');
            }
            row.find('a').prop('href', file.url);
            row.find('.delete')
                .attr('data-type', file.delete_type)
                .attr('data-url', file.deleteUrl);
            // add file data input
            row.append('<input type="hidden" name="galleryImage[]">')
                .find('input[name="galleryImage[]"]').val(file.name);
            row.find('img').data('fileinfo',file);
        }
        // rows = rows.add(row);
        $('#upload_gallery_files').append(row);
    });
}

$(document).bind('drop dragover', function (e) {
    e.preventDefault();
});