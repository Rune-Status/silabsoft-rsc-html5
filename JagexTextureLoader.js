/**
 * Created by Silabsoft on 8/17/2016.
 */
(function () {


    THREE.JagexTextureLoader = function (manager, config, spriteData) {

        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
        this.config = THREE.ConfigLoader;
        this.rawSpriteCache = spriteData;
        this.surface = spriteData;
        this.config = config;
        this.textures = [];
    };

    THREE.JagexTextureLoader.prototype = {

        constructor: THREE.JagexTextureLoader,

        load: function (url, onLoad, onProgress, onError) {
            var scope = this;
            this._url = url;
            this._baseDir = url.substr(0, url.lastIndexOf('/') + 1);
            var loader = new THREE.XHRLoader(this.manager);
            loader.setResponseType('arraybuffer');
            loader.load(url, function (text) {
                onLoad(scope.parsePackedCache(text));

            }, onProgress, onError);

        },

        parsePackedCache: function (data) {

            this._ptr = 0;
            this._data = new DataView(data);
            var archiveSize = 0;
            var archiveSizeCompressed = 0;

            var archiveSize = ((this.read8() & 0xff) << 16) + ((this.read8() & 0xff) << 8) + (this.read8() & 0xff);
            var archiveSizeCompressed = ((this.read8() & 0xff) << 16) + ((this.read8() & 0xff) << 8) + (this.read8() & 0xff);

            if (archiveSizeCompressed != archiveSize) {

                data = bzip2.decompress(this._data.buffer.slice(6), archiveSizeCompressed, archiveSize);

                this._ptr = 0;
                this._data = new DataView(data);
            }
            else {

                this._data = new DataView(this._data.buffer.slice(6));
                this._ptr = 0;
            }
            return this.parseTextures();
        },
        parseTextures: function () {

            var index = this.unpackData("index.dat");

            var textures = this.allocateTextures(this.config.textureCount, 7, 11);

            for (var i = 0; i < this.config.textureCount; i++) {
                var name = config.textureName[i];
                var buff1 = this.unpackData(name + ".dat");
                this.surface.setBounds(0,0,128,128)
                this.surface.drawBox(0, 0, 128, 128, 0xff00ff);
                this.parseSprite(this.rawSpriteCache.spriteTexture, buff1, index, 1);
                this.surface.drawSprite(0, 0, this.rawSpriteCache.spriteTexture);

                var wh = this.rawSpriteCache.spriteWidthFull[this.rawSpriteCache.spriteTexture];
                var nameSub = config.textureSubtypeName[i];
                if (nameSub != undefined && nameSub.length > 0) {
                    var buff2 = this.unpackData(nameSub + ".dat");
                    this.parseSprite(this.rawSpriteCache.spriteTexture, buff2, index, 1);
                    this.surface.drawSprite(0, 0, this.rawSpriteCache.spriteTexture);
                }
                this.surface.fillSpritePixelsFromDrawingArea( this.rawSpriteCache.spriteTextureWorld + i, 0, 0, wh, wh);
                this.textures.push(  this.surface.getCanvas());

            }









            return this.textures;
        },
        toColor: function (num) {
            if(num == undefined){
                num = 0;
            }
            var b = num & 0xFF,
                g = (num & 0xFF00) >>> 8,
                r = (num & 0xFF0000) >>> 16;

            return [r, g, b];
        },
        parseSprite(spriteId, spriteData, indexData, frameCount) {

            var indexOff = this.getUnsignedShort(spriteData, 0);

            var fullWidth = this.getUnsignedShort(indexData, indexOff);
            indexOff += 2;
            var fullHeight = this.getUnsignedShort(indexData, indexOff);
            indexOff += 2;
            var colourCount = this.getSignedByte(indexData, indexOff++) & 0xff;
            var colours = [colourCount];
            colours[0] = 0xff00ff;
            for (var i = 0; i < colourCount - 1; i++) {
                colours[i + 1] = ((this.getSignedByte(indexData, indexOff) & 0xff) << 16) + ((this.getSignedByte(indexData, indexOff + 1) & 0xff) << 8) + (this.getSignedByte(indexData, indexOff + 2) & 0xff);
                indexOff += 3;
            }

            var spriteOff = 2;

            for (var id = spriteId; id < spriteId + frameCount; id++) {

                this.rawSpriteCache.spriteTranslateX[id] = this.getSignedByte(indexData, indexOff++) & 0xff;
                this.rawSpriteCache.spriteTranslateY[id] = this.getSignedByte(indexData, indexOff++) & 0xff;
                this.rawSpriteCache.spriteWidth[id] = this.getUnsignedShort(indexData, indexOff);
                indexOff += 2;
                this.rawSpriteCache.spriteHeight[id] = this.getUnsignedShort(indexData, indexOff);
                indexOff += 2;
                var unknown = this.getSignedByte(indexData, indexOff++) & 0xff;
                var size = this.rawSpriteCache.spriteWidth[id] * this.rawSpriteCache.spriteHeight[id];
                this.rawSpriteCache.spriteColoursUsed[id] = [size];
                this.rawSpriteCache.spriteColourList[id] = colours;

                this.rawSpriteCache.spriteWidthFull[id] = fullWidth;
                this.rawSpriteCache.spriteHeightFull[id] = fullHeight;
                this.rawSpriteCache.spritePixels[id] = null;
                this.rawSpriteCache.spriteTranslate[id] = false;
                if (this.rawSpriteCache.spriteTranslateX[id] != 0 || this.rawSpriteCache.spriteTranslateY[id] != 0)
                    this.rawSpriteCache.spriteTranslate[id] = true;
                if (unknown == 0) {
                    for (var pixel = 0; pixel < size; pixel++) {
                        this.rawSpriteCache.spriteColoursUsed[id][pixel] = this.getSignedByte(spriteData, spriteOff++);
                        if (this.rawSpriteCache.spriteColoursUsed[id][pixel] == 0)
                            this.rawSpriteCache.spriteTranslate[id] = true;
                    }

                } else if (unknown == 1) {
                    for (var x = 0; x < this.rawSpriteCache.spriteWidth[id]; x++) {
                        for (var y = 0; y < this.rawSpriteCache.spriteHeight[id]; y++) {
                            this.rawSpriteCache.spriteColoursUsed[id][x + y * this.rawSpriteCache.spriteWidth[id]] = this.getSignedByte(spriteData, spriteOff++);
                            if (this.rawSpriteCache.spriteColoursUsed[id][x + y * this.rawSpriteCache.spriteWidth[id]] == 0)
                                this.rawSpriteCache.spriteTranslate[id] = true;
                        }

                    }

                }
            }

        },
        getSignedByte: function (data, offset) {

            var i = data.getInt8(offset);
            return i;
        },
        getUnsignedShort: function (data, offset) {

            var i = data.getUint16(offset);
            return i;
        },
        allocateTextures: function (count, something7, something11) {
            var textures;
            return textures = {
                textureCount: count,
                textureColoursUsed: this.createArray(count, 0),
                textureColourList: this.createArray(count, 0),
                textureDimension: [count],
                textureLoadedNumber: [count],
                textureBackTransparent: [count],
                texturePixels: this.createArray(count, 0),
                textureCountLoaded: 0,
                textureColours64: this.createArray(count, 0),// 64x64 rgba
                textureColours128: this.createArray(count, 0),// 128x128 rgba
            }
        },
        createArray: function (length) {
            var arr = new Array(length || 0),
                i = length;

            if (arguments.length > 1) {
                var args = Array.prototype.slice.call(arguments, 1);
                while (i--) arr[length - 1 - i] = this.createArray.apply(this, args);
            }

            return arr;
        },
        unpackData: function (filename) {
            var numEntries = (this.peek8(0) & 0xff) * 256 + (this.peek8(1) & 0xff);
            var wantedHash = 0;

            filename = filename.toUpperCase();

            for (var l = 0; l < filename.length; l++) {
                //had to use Math.imul to simulate signed 32 int overflow
                wantedHash = ( Math.imul(wantedHash, 61) + filename.charCodeAt(l)) - 32;
            }

            var offset = 2 + numEntries * 10;
            for (var entry = 0; entry < numEntries; entry++) {
                var fileHash = Math.imul((this.peek8(entry * 10 + 2) & 0xff), 0x1000000) + Math.imul((this.peek8(entry * 10 + 3) & 0xff), 0x10000) + Math.imul((this.peek8(entry * 10 + 4) & 0xff), 256) + (this.peek8(entry * 10 + 5) & 0xff);
                var fileSize = Math.imul((this.peek8(entry * 10 + 6) & 0xff), 0x10000) + Math.imul((this.peek8(entry * 10 + 7) & 0xff), 256) + (this.peek8(entry * 10 + 8) & 0xff);
                var fileSizeCompressed = Math.imul((this.peek8(entry * 10 + 9) & 0xff), 0x10000) + Math.imul((this.peek8(entry * 10 + 10) & 0xff), 256) + (this.peek8(entry * 10 + 11) & 0xff);

                if (fileHash == wantedHash) {

                    if (fileSize != fileSizeCompressed) {


                        console.log("shit");
                        var out = [];
                        BZLib.decompress(out, fileSize, Array.prototype.slice.call(new Int8Array(this._data.buffer)), fileSizeCompressed, offset);
                        return new DataView(out);


                    } else {

                        return new DataView(this._data.buffer.slice(offset, offset + fileSize));
                    }

                }
                offset += fileSizeCompressed;
            }

            return null;
        },
        peek8: function (offset) {
            var a = this._data.getUint8(offset);
            return a;
        },

        read8: function () {
            var a = this._data.getUint8(this._ptr);
            this._ptr += 1;
            return a;
        },
        readU16: function () {

            var a = this._data.getUint16(this._ptr, false);
            this._ptr += 2;
            return a;

        },
        readS16: function () {
            var a = this._data.getInt16(this._ptr, false);
            this._ptr += 2;
            return a;
        }
    };

})();
