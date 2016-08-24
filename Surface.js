(function () {


    THREE.Surface = function () {
        var limit = 40000;

        this.spritePixels = [limit];
        this.spriteTranslate = [limit];
        this.spriteColoursUsed = [limit];
        this.spriteColourList = [limit];
        this.spriteWidth = [limit];
        this.spriteHeight = [limit];
        this.spriteWidthFull = [limit];
        this.spriteHeightFull = [limit];
        this.spriteTranslateX = [limit];
        this.spriteTranslateY = [limit];
        this.sprite = [];
        this.spriteMedia = 2000;
        this.spriteUtil = this.spriteMedia + 100;
        this.spriteItem = this.spriteUtil + 50;
        this.spriteLogo = this.spriteItem + 1000;
        this.spriteProjectile = this.spriteLogo + 10;
        this.spriteTexture = this.spriteProjectile + 50;
        /*    if (Version.CLIENT > 204) {
         spriteCrowns = spriteTexture + 10;
         spriteTextureWorld = spriteCrowns + 5;
         } else {
         */
        this.spriteCrowns = this.spriteTexture + 10;
        this.spriteTextureWorld = this.spriteCrowns + 5;
        //}
    };

    THREE.Surface.prototype = {

        constructor: THREE.Surface,
        setBounds: function (x, y, w, h) {
            this.pixels = [w * h];
            this.width = w;
            this.height = h;
            this.boundsBottomY = h;
            this. boundsBottomX = w;
            this.width1 =  this.width2 = w;
            this. height1 =  this.height2 = h;

        },
        drawBox: function (x, y, w, h, colour) {

            var pixelIdx = x + y;
            for (var l1 = -h; l1 < 0; l1++) {
                for (var i2 = -w; i2 < 0; i2++)
                    this.pixels[pixelIdx++] = colour;

            }
        },
        drawSprite: function (x, y, id) {
            if (this.spriteTranslate[id]) {
                x += this.spriteTranslateX[id];
                y += this.spriteTranslateY[id];
            }
            var rY = x + y * this.width2;
            var rX = 0;
            var height = this.spriteHeight[id];
            var width = this.spriteWidth[id];
            var w2 = this.width2 - width;
            var h2 = 0;
            if (y < this.boundsTopY) {
                var j2 = this.boundsTopY - y;
                height -= j2;
                y = this.boundsTopY;
                rX += j2 * width;
                rY += j2 * this.width2;
            }
            if (y + height >= this.boundsBottomY)
                height -= ((y + height) - this.boundsBottomY) + 1;
            if (x < this.boundsTopX) {
                var k2 =this. boundsTopX - x;
                width -= k2;
                x = this.boundsTopX;
                rX += k2;
                rY += k2;
                h2 += k2;
                w2 += k2;
            }
            if (x + width >= this.boundsBottomX) {
                var l2 = ((x + width) - this.boundsBottomX) + 1;
                width -= l2;
                h2 += l2;
                w2 += l2;
            }
            if (width <= 0 || height <= 0)
                return;

            if (this.spritePixels[id] == null) {
                this.drawSpriteFillPixels(this.pixels, this.spriteColoursUsed[id], this.spriteColourList[id], rX, rY, width, height, w2, h2, 1);
                return;
            } else {
                drawSprite(this.pixels, this.spritePixels[id], 0, rX, rY, width, height, w2, h2, 1);
                return;
            }
        },
        fillSpritePixelsFromDrawingArea: function (sprite, x, y, width, height) {// used from mudclient
            this.spriteWidth[sprite] = width;
            this.spriteHeight[sprite] = height;
            this.spriteTranslate[sprite] = false;
            this.spriteTranslateX[sprite] = 0;
            this.spriteTranslateY[sprite] = 0;
            this.spriteWidthFull[sprite] = width;
            this.spriteHeightFull[sprite] = height;
            var area = width * height;
            var pixel = 0;
            this.spritePixels[sprite] = [area];
            for (var yy = y; yy < y + height; yy++) {
                for (var xx = x; xx < x + width; xx++)
                    this.spritePixels[sprite][pixel++] =  this.pixels[xx + yy * width];

            }

        },

        drawSpriteFillPixels: function (target, colourIdx, colours, srcPos, destPos, width, height, w2, h2, rowInc) {
            var i2 = -(width >> 2);
            width = -(width & 3);
            for (var j2 = -height; j2 < 0; j2 += 1) {
                for (var k2 = i2; k2 < 0; k2++) {
                    var byte0 = colourIdx[srcPos++];
                    if (byte0 != 0)
                        target[destPos++] = colours[byte0 & 0xff];
                    else
                        destPos++;
                    byte0 = colourIdx[srcPos++];
                    if (byte0 != 0)
                        target[destPos++] = colours[byte0 & 0xff];
                    else
                        destPos++;
                    byte0 = colourIdx[srcPos++];
                    if (byte0 != 0)
                        target[destPos++] = colours[byte0 & 0xff];
                    else
                        destPos++;
                    byte0 = colourIdx[srcPos++];
                    if (byte0 != 0)
                        target[destPos++] = colours[byte0 & 0xff];
                    else
                        destPos++;
                }

                for (var k2 = width; k2 < 0; k2++) {
                    var byte1 = colourIdx[srcPos++];
                    if (byte1 != 0)
                        target[destPos++] = colours[byte1 & 0xff];
                    else
                        destPos++;
                }

                destPos += w2;
                srcPos += h2;
            }


        },
        drawSpriteNow: function (dest, src, i, srcPos, destPos, width, height, j1, k1, yInc) {

            var l1 = -(width >> 2);
            width = -(width & 3);
            for (var i2 = -height; i2 < 0; i2 += 1) {
                for (var j2 = l1; j2 < 0; j2++) {
                    i = src[srcPos++];
                    if (i != 0)
                        dest[destPos++] = i;
                    else
                        destPos++;
                    i = src[srcPos++];
                    if (i != 0)
                        dest[destPos++] = i;
                    else
                        destPos++;
                    i = src[srcPos++];
                    if (i != 0)
                        dest[destPos++] = i;
                    else
                        destPos++;
                    i = src[srcPos++];
                    if (i != 0)
                        dest[destPos++] = i;
                    else
                        destPos++;
                }

                for (var l2 = width; l2 < 0; l2++) {
                    i = src[srcPos++];
                    if (i != 0)
                        dest[destPos++] = i;
                    else
                        destPos++;
                }

                destPos += j1;
                srcPos += k1;
            }

        },
        getCanvas(){
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            var imageData = ctx.createImageData(this.width, this.height);
            var pixelIdx = 0;
            var colorIdx = 0;
            for (var l1 = -this.height; l1 < 0; l1++) {
                for (var i2 = -this.width; i2 < 0; i2++) {
                    var color = this.pixels[pixelIdx++];
                    if (color == 0xff00ff) {
                        imageData.data[colorIdx++] = 0;
                        imageData.data[colorIdx++] = 0;
                        imageData.data[colorIdx++] = 0;
                        imageData.data[colorIdx++] = 0;
                    } else {

                        color = this.toColor(color);

                        imageData.data[colorIdx++] = color[0];
                        imageData.data[colorIdx++] = color[1];
                        imageData.data[colorIdx++] = color[2];
                        imageData.data[colorIdx++] = 255;
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);


            return canvas;
        },
        toColor: function (num) {
            if (num == undefined) {
                num = 0xffffff;
            }

            var b = num & 0xFF,
                g = (num & 0xFF00) >>> 8,
                r = (num & 0xFF0000) >>> 16;

            return [r, g, b];
        }
    }

})();