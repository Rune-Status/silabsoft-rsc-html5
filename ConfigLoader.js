/**
 * Created by Silabsoft on 8/17/2016.
 */
(function () {


    THREE.ConfigLoader = function (manager) {

        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;


    };

    THREE.ConfigLoader.prototype = {

        constructor: THREE.ConfigLoader,

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

                this._ptr = 6;
                this._data = new DataView(data);
            }
            else {
                this._data = new DataView(this._data.buffer.slice(6));
            }
            return this.parseConfig();
        },
        parseConfig: function () {


           // this.dataString = this.unpackData("string.dat").data;
            // this.stringOffset = 0;


            var idat = this.unpackData("integer.dat");
            this.intOffset = 0;
            console.log("wtf: "+idat.data.buffer.byteLength+" "+this._data.buffer.byteLength);
            this.itemCount = this.getUnsignedShort();
            console.log("items: " + this.itemCount);
        },
        unpackData: function (filename) {
            var numEntries = (this.read8() & 0xff) * 256 + (this.read8() & 0xff);
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
                    console.log(fileHash+" "+fileSize+" "+fileSizeCompressed);
                    if (fileSize != fileSizeCompressed) {

                        /*
                         var out = [];
                         BZLib.decompress(out, fileSize, Array.prototype.slice.call(new Int8Array(this._data.buffer)), fileSizeCompressed, offset);
                         return {data: new DataView(out), size: fileSize, offset: 0};
                         */
                        return null;
                    } else {
                        console.log(offset+" "+parseInt(offset+fileSize)+" "+parseInt((offset+fileSize)-offset));
                        return {data: new DataView(this._data.buffer.slice(parseInt(offset),+parseInt(offset+fileSize))),offset: parseInt(offset)};
                    }

                }
                offset += fileSizeCompressed;
            }

            return null;
        },
        getUnsignedShort: function () {

            var i = this._data.getUint16(this.intOffset,false);
            console.log(i);
            this.intOffset += 2;
            return i;
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
