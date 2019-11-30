// Manipulation des images

// Fonction accessible depuis drop.js
var discardLoadedImage;

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Crée une nouvelle image vide
    function newImg(width, height) {
        return Array(height).fill(0).map(function() {
            return Array(width).fill(0).map(function() {
                return {r: 0, g: 0, b: 0};
            });
        });
    }

    // Image loadée au format tableau 2D de structures r/g/b
    var loadedImg = null;

    discardLoadedImage = function() {
        loadedImg = null;
    }

    /* Lis et retourne l'image contenue dans le canvas (ou l'image
       loadée si elle est disponible) */
    function readImg() {
        if(loadedImg)
            return loadedImg;

        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        var img = newImg(canvas.width, canvas.height);

        var y = 0, x = 0;
        for(var i=0; i<data.length; i+=4) {

            img[y][x].r = data[i];
            img[y][x].g = data[i + 1];
            img[y][x].b = data[i + 2];

            x++;
            if(x == canvas.width) {
                x = 0;
                y++;
            }
        }

        return img;
    };

    // Clone a 2D image
    function cloneImg(data) {
        return data.map(function(line) {
            return line.map(function(pix) {
                return Object.assign({}, pix);
            });
        });
    }

    /* Load dans le canvas une image du format :
       Tableau 2D d'objets {r: 0-255, g: 0-255, b:0-255}
     */
    function loadImg(data) {
        // Save the image
        loadedImg = cloneImg(data);

        // Put
        var buffer = ctx.createImageData(canvas.width, canvas.height);

        for(var y=0; y<canvas.height; y++)
            for(var x=0; x<canvas.width; x++) {
                buffer.data[y * canvas.width * 4 + x * 4 + 0] = data[y][x].r|0;
                buffer.data[y * canvas.width * 4 + x * 4 + 1] = data[y][x].g|0;
                buffer.data[y * canvas.width * 4 + x * 4 + 2] = data[y][x].b|0;
                buffer.data[y * canvas.width * 4 + x * 4 + 3] = 255;
            }

        ctx.putImageData(buffer, 0, 0);
    };

    // Définitions des événements
    document.querySelector('#exporter').addEventListener('click', function() {
        var img = canvas.toDataURL("image/png");
        window.open(img, '_blank');
    });

    function appliquerFiltre(fct, args) {
        var img = readImg();

        // Message "Loading"
        var x = canvas.width / 2;
        var y = canvas.height / 2;

        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'black';
        ctx.strokeText('Chargement...', x, y);
        ctx.fillText('Chargement...', x, y);

        setTimeout(function() {
            var result = fct.apply(null, [img].concat(args));
            loadImg(result);
        }, 0);
    }

    // Bind un événement à un bouton du menu
    function bind(button, fct) {
        document.querySelector(button).addEventListener('click', fct);
    }

    bind('#noirEtBlanc', function() {
        appliquerFiltre(noirEtBlanc);
    });

    bind('#augmenter-luminosite', function() {
        appliquerFiltre(correctionClarte, 1.5);
    });

    bind('#reduire-luminosite', function() {
        appliquerFiltre(correctionClarte, 0.5);
    });

    bind('#flou', function() {
        var taille = +prompt('Taille du flou?');

        if(!isNaN(taille) && taille > 1)
            appliquerFiltre(flou, taille);
    });

    bind('#detection-contours', function() {
        appliquerFiltre(detectionContours);
    });
});
