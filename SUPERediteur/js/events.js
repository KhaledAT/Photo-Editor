// Gestion des événements

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var nameLabel = document.getElementById('image-label');
    var buttonIds = [
        '#exporter',
        '#annuler',
        '#noirEtBlanc',
        '#augmenter-luminosite',
        '#reduire-luminosite',
        '#flou',
        '#detection-contours'
    ];

    // Désactive les boutons (a priori, aucune image n'est chargée)
    document.querySelectorAll(buttonIds.join(',')).forEach(function (x) {
        x.disabled = true;
    });

    /* Fonction qui active les boutons (les boutons sont désactivés
       par défaut et sont activés lorsqu'une image est chargée) */
    function enableButtons() {
        document.querySelectorAll(buttonIds.join(',')).forEach(function (x) {
            x.disabled = false;
        });
    }

    /* Load la dernière image chargée (pour éviter d'avoir à
       re-drag/drop des images à chaque rechargement de la page) */
    function loadStoredImage() {
        var defaultImg = new Image();

        discardLoadedImage();

        defaultImg.onload = function() {

            nameLabel.innerHTML = localStorage.getItem('name');

            canvas.width = localStorage.getItem('width');
            canvas.height = localStorage.getItem('height');
            ctx.drawImage(defaultImg, 0, 0);
            enableButtons();
        };

        defaultImg.src = localStorage.getItem('defaultImage');
    };

    // Load l'image par défaut s'il y en a une
    if(localStorage.getItem('defaultImage')) {
        loadStoredImage();
    }

    // Drag & Drop
    function handleDrop(e) {
        var dt = e.dataTransfer;
        updateImage(dt.files);
    }

    function updateImage(files) {
        if(files.length != 1)
            return;

        var file = files[0];

        nameLabel.innerHTML = file.name;

        var reader  = new FileReader();

        reader.addEventListener('load', function () {
            var img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Sauvegarde l'image droppée dans le localStorage
                localStorage.setItem('defaultImage', reader.result);
                localStorage.setItem('width', img.width);
                localStorage.setItem('height', img.height);
                localStorage.setItem('name', file.name);
            };

            img.src = reader.result;
            discardLoadedImage();
            enableButtons();
        });

        reader.readAsDataURL(file);
    }

    var canvas = document.getElementById('canvas');
    var fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', function(e) {
        updateImage(fileInput.files);
    });

    canvas.addEventListener('dblclick', function(e) {
        fileInput.click();
    });

    canvas.addEventListener('dragenter', function(e) {
        canvas.classList.add('file-hover');
    });

    canvas.addEventListener('dragleave', function(event) {
        event.preventDefault();
        event.stopPropagation();
        canvas.classList.remove('file-hover');
    });

    canvas.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();

        canvas.classList.remove('file-hover');

        handleDrop(e);
    });

    document.querySelector('#annuler').addEventListener('click', function() {
        loadStoredImage();
    });
});
