/**
 * Created by Silabsoft on 8/17/2016.
 */
(function () {


    THREE.MediaLoader = function (manager, config, spriteData) {
        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
        this.surface = spriteData;
        this.config = config;
    };

    THREE.MediaLoader.prototype = {

        constructor: THREE.MediaLoader,

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
            return this.parseMedia();
        },
        parseMedia: function () {
            var buff = this.unpackData("index.dat");
            surface.parseSprite(surface.spriteMedia,this.unpackData("inv1.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 1, this.unpackData("inv2.dat"), buff, 6);
            surface.parseSprite(surface.spriteMedia + 9, this.unpackData("bubble.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 10, this.unpackData("runescape.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 11, this.unpackData("splat.dat"), buff, 3);
            surface.parseSprite(surface.spriteMedia + 14,this.unpackData("icon.dat"), buff, 8);
            surface.parseSprite(surface.spriteMedia + 22,this.unpackData("hbar.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 23, this.unpackData("hbar2.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 24, this.unpackData("compass.dat"), buff, 1);
            surface.parseSprite(surface.spriteMedia + 25, this.unpackData("buttons.dat"), buff, 2);
            surface.parseSprite(surface.spriteUtil,this.unpackData("scrollbar.dat"), buff, 2);
            surface.parseSprite(surface.spriteUtil + 2, this.unpackData("corners.dat"), buff, 4);
            surface.parseSprite(surface.spriteUtil + 6, this.unpackData("arrows.dat"), buff, 2);
            surface.parseSprite(surface.spriteProjectile, this.unpackData("projectile.dat"), buff, this.config.projectileSprite);

            var i = config.itemSpriteCount;
            for (var j = 1; i > 0; j++) {
                var k = i;
                i -= 30;
                if (k > 30) {
                    k = 30;
                }
                surface.parseSprite(surface.spriteItem + (j - 1) * 30,  this.unpackData("objects" + j + ".dat"), buff, k);
            }

            surface.loadSprite(surface.spriteMedia);
            surface.loadSprite(surface.spriteMedia + 9);
            for (var l = 11; l <= 26; l++) {
                surface.loadSprite(surface.spriteMedia + l);
            }

            for (var i1 = 0; i1 < config.projectileSprite; i1++) {
                surface.loadSprite(surface.spriteProjectile + i1);
            }

            for (var j1 = 0; j1 < config.itemSpriteCount; j1++) {
                surface.loadSprite(surface.spriteItem + j1);
            }

            return surface;
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
