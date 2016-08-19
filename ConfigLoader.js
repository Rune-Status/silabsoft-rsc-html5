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
                console.log("shit");
                data = BZLib.decompress(Array.prototype.slice.call(new Int8Array(this._data.buffer.slice(6))), archiveSizeCompressed, archiveSize);

                this._ptr = 0;
                this._data = new DataView(data);
                console.log(data.byteLength);
            }
            else {
                this._data = new DataView(this._data.buffer.slice(6));
                this._ptr = 0;
            }
            return this.parseConfig();
        },
        parseConfig: function () {

            this.stringData = this.unpackData("string.dat");
            this.stringOffset = 0;

            this.intData = this.unpackData("integer.dat");
            this.intOffset = 0;
            config = {
                itemCount: this.getUnsignedShort(),
                itemName: [this.itemCount],
                itemDescription: [this.itemCount],
                itemCommand: [this.itemCount],
                itemPicture: [this.itemCount],
                itemBasePrice: [this.itemCount],
                itemStackable: [this.itemCount],
                itemUnused: [this.itemCount],
                itemWearable: [this.itemCount],
                itemMask: [this.itemCount],
                itemSpecial: [this.itemCount],
                itemMembers: [this.itemCount],
                itemSpriteCount: 0,
                modelName : [],
                modelCount : 0,
                getModelIndex : function(s) {
                    if (s.toUpperCase() === "na".toUpperCase())
                        return 0;
                    for (var i = 0; i < this.modelCount; i++)

                        if (this.modelName[i].toUpperCase() === s.toUpperCase())
                            return i;

                    this.modelName[this.modelCount++] = s;
                    return this.modelCount - 1;
                },
            }
            for (var i = 0; i < config.itemCount; i++)
                config.itemName[i] = this.getString();

            for (var i = 0; i < config.itemCount; i++)
                config.itemDescription[i] = this.getString();


            for (var i = 0; i < config.itemCount; i++)
                config.itemCommand[i] = this.getString();


            for (var i = 0; i < config.itemCount; i++) {
                config.itemPicture[i] = this.getUnsignedShort();
                if (config.itemPicture[i] + 1 > config.itemSpriteCount)
                    config.itemSpriteCount = config.itemPicture[i] + 1;
            }

            for (var i = 0; i < config.itemCount; i++)
                config.itemBasePrice[i] = this.getUnsignedInt();

            for (var i = 0; i < config.itemCount; i++)
                config.itemStackable[i] = this.getUnsignedByte();

            for (var i = 0; i < config.itemCount; i++)
                config.itemUnused[i] = this.getUnsignedByte();

            for (var i = 0; i < config.itemCount; i++)
                config.itemWearable[i] = this.getUnsignedShort();

            for (var i = 0; i < config.itemCount; i++)
                config.itemMask[i] = this.getUnsignedInt();

            for (var i = 0; i < config.itemCount; i++)
                config.itemSpecial[i] = this.getUnsignedByte();

            for (var i = 0; i < config.itemCount; i++)
                config.itemMembers[i] = this.getUnsignedByte();

            config.npcCount = this.getUnsignedShort(),
                config.npcName = [config.npcCount];
            config.npcDescription = [config.npcCount];
            config.npcCommand = [config.npcCount];
            config.npcAttack = [config.npcCount];
            config.npcStrength = [config.npcCount];
            config.npcHits = [config.npcCount];
            config.npcDefense = [config.npcCount];
            config.npcAttackable = [config.npcCount];
            config.npcSprite = this.createArray(config.npcCount, 12);
            config.npcColourHair = [config.npcCount];
            config.npcColourTop = [config.npcCount];
            config.npcColorBottom = [config.npcCount];
            config.npcColourSkin = [config.npcCount];
            config.npcWidth = [config.npcCount];
            config.npcHeight = [config.npcCount];
            config.npcWalkModel = [config.npcCount];
            config.npcCombatModel = [config.npcCount];
            config.npcCombatAnimation = [config.npcCount];
            for (var i = 0; i < config.npcCount; i++)
                config.npcName[i] = this.getString();

            for (var i = 0; i < config.npcCount; i++)
                config.npcDescription[i] = this.getString();

            for (var i = 0; i < config.npcCount; i++)
                config.npcAttack[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcStrength[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcHits[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcDefense[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcAttackable[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++) {
                for (var i5 = 0; i5 < 12; i5++) {
                    config.npcSprite[i][i5] = this.getUnsignedByte();
                    if (config.npcSprite[i][i5] == 255)
                        config.npcSprite[i][i5] = -1;
                }
            }
            for (var i = 0; i < config.npcCount; i++)
                config.npcColourHair[i] = this.getUnsignedInt();

            for (var i = 0; i < config.npcCount; i++)
                config.npcColourTop[i] = this.getUnsignedInt();

            for (var i = 0; i < config.npcCount; i++)
                config.npcColorBottom[i] = this.getUnsignedInt();

            for (var i = 0; i < config.npcCount; i++)
                config.npcColourSkin[i] = this.getUnsignedInt();

            for (var i = 0; i < config.npcCount; i++)
                config.npcWidth[i] = this.getUnsignedShort();

            for (var i = 0; i < config.npcCount; i++)
                config.npcHeight[i] = this.getUnsignedShort();

            for (var i = 0; i < config.npcCount; i++)
                config.npcWalkModel[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcCombatModel[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcCombatAnimation[i] = this.getUnsignedByte();

            for (var i = 0; i < config.npcCount; i++)
                config.npcCommand[i] = this.getString();

            config.textureCount = this.getUnsignedShort();
            config.textureName = [config.textureCount];
            config.textureSubtypeName = [config.textureCount];
            for (var i = 0; i < config.textureCount; i++)
                config.textureName[i] = this.getString();

            for (var i = 0; i < config.textureCount; i++)
                config.textureSubtypeName[i] = this.getString();


            config.animationCount = this.getUnsignedShort();
            config.animationName = [config.animationCount];
            config.animationCharacterColour = [config.animationCount];
            config.animationSomething = [config.animationCount];
            config.animationHasA = [config.animationCount];
            config.animationHasF = [config.animationCount];
            config.animationNumber = [config.animationCount];
            for (var i = 0; i < config.animationCount; i++)
                config.animationName[i] = this.getString();

            for (var i = 0; i < config.animationCount; i++)
                config.animationCharacterColour[i] = this.getUnsignedInt();

            for (var i = 0; i < config.animationCount; i++)
                config.animationSomething[i] = this.getUnsignedByte();

            for (var i = 0; i < config.animationCount; i++)
                config.animationHasA[i] = this.getUnsignedByte();

            for (var i = 0; i < config.animationCount; i++)
                config.animationHasF[i] = this.getUnsignedByte();

            for (var i = 0; i < config.animationCount; i++)
                config.animationNumber[i] = this.getUnsignedByte();


            config.objectCount = this.getUnsignedShort();
            config.objectName = [config.objectCount];
            config.objectDescription = [config.objectCount];
            config.objectCommand1 = [config.objectCount];
            config.objectCommand2 = [config.objectCount];
            config.objectModelIndex = [config.objectCount];
            config.objectWidth = [config.objectCount];
            config.objectHeight = [config.objectCount];
            config.objectType = [config.objectCount];
            config.objectElevation = [config.objectCount];
            for (var i = 0; i < config.objectCount; i++)
                config.objectName[i] = this.getString();

            for (var i = 0; i < config.objectCount; i++)
                config.objectDescription[i] = this.getString();

            for (var i = 0; i < config.objectCount; i++)
                config.objectCommand1[i] = this.getString();

            for (var i = 0; i < config.objectCount; i++)
                config.objectCommand2[i] = this.getString();

            for (var i = 0; i < config.objectCount; i++)
                config.objectModelIndex[i] = config.getModelIndex(this.getString());

            for (var i = 0; i < config.objectCount; i++)
                config.objectWidth[i] = this.getUnsignedByte();

            for (var i = 0; i < config.objectCount; i++)
                config.objectHeight[i] = this.getUnsignedByte();

            for (var i = 0; i < config.objectCount; i++)
                config.objectType[i] = this.getUnsignedByte();

            for (var i = 0; i < config.objectCount; i++)
                config.objectElevation[i] = this.getUnsignedByte();

            config.wallObjectCount = this.getUnsignedShort();
            config.wallObjectName = [config.wallObjectCount];
            config.wallObjectDescription = [config.wallObjectCount];
            config.wallObjectCommand1 = [config.wallObjectCount];
            config.wallObjectCommand2 = [config.wallObjectCount];
            config.wallObjectHeight = [config.wallObjectCount];
            config.wallObjectTextureFront = [config.wallObjectCount];
            config.wallObjectTextureBack = [config.wallObjectCount];
            config.wallObjectAdjacent = [config.wallObjectCount];
            config.wallObjectInvisible = [config.wallObjectCount];
            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectName[i] = this.getString();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectDescription[i] = this.getString();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectCommand1[i] = this.getString();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectCommand2[i] = this.getString();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectHeight[i] = this.getUnsignedShort();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectTextureFront[i] = this.getUnsignedInt();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectTextureBack[i] = this.getUnsignedInt();

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectAdjacent[i] = this.getUnsignedByte();// what's this?

            for (var i = 0; i < config.wallObjectCount; i++)
                config.wallObjectInvisible[i] = this.getUnsignedByte();// value is 0 if visible

            config.roofCount = this.getUnsignedShort();// the World class does something with these
            config.roofHeight = [config.roofCount];
            config.roofNumVertices = [config.roofCount];
            for (var i = 0; i < config.roofCount; i++)
                config.roofHeight[i] = this.getUnsignedByte();

            for (var i = 0; i < config.roofCount; i++)
                config.roofNumVertices[i] = this.getUnsignedByte();

            config.tileCount = this.getUnsignedShort();// and these
            config.tileDecoration = [config.tileCount];
            config.tileType = [config.tileCount];
            config.tileAdjacent = [config.tileCount];
            for (var i = 0; i < config.tileCount; i++)
                config.tileDecoration[i] = this.getUnsignedInt();

            for (var i = 0; i < config.tileCount; i++)
                config.tileType[i] = this.getUnsignedByte();

            for (var i = 0; i < config.tileCount; i++)
                config.tileAdjacent[i] = this.getUnsignedByte();

            config.projectileSprite = this.getUnsignedShort();
            config.spellCount = this.getUnsignedShort();
            config.spellName = [config.spellCount];
            config.spellDescription = [config.spellCount];
            config.spellLevel = [config.spellCount];
            config.spellRunesRequired = [config.spellCount];
            config.spellType = [config.spellCount];
            config.spellRunesId = this.createArray(config.spellCount, 0);
            config.spellRunesCount = this.createArray(config.spellCount, 0);
            for (var i = 0; i < config.spellCount; i++)
                config.spellName[i] = this.getString();

            for (var i = 0; i < config.spellCount; i++)
                config.spellDescription[i] = this.getString();

            for (var i = 0; i < config.spellCount; i++)
                config.spellLevel[i] = this.getUnsignedByte();

            for (var i = 0; i < config.spellCount; i++)
                config.spellRunesRequired[i] = this.getUnsignedByte();

            for (var i = 0; i < config.spellCount; i++)
                config.spellType[i] = this.getUnsignedByte();

            for (var i = 0; i < config.spellCount; i++) {
                var j = this.getUnsignedByte();
                config.spellRunesId[i] = [j];
                for (var k = 0; k < j; k++)
                    config.spellRunesId[i][k] = this.getUnsignedShort();
            }

            for (var i = 0; i < config.spellCount; i++) {
                var j = this.getUnsignedByte();
                config.spellRunesCount[i] = [j];
                for (var k = 0; k < j; k++)
                    config.spellRunesCount[i][k] = this.getUnsignedByte();
            }

            config.prayerCount = this.getUnsignedShort();
            config.prayerName = [config.prayerCount];
            config.prayerDescription = [config.prayerCount];
            config.prayerLevel = [config.prayerCount];
            config.prayerDrain = [config.prayerCount];
            for (var i = 0; i < config.prayerCount; i++)
                config.prayerName[i] = this.getString();

            for (var i = 0; i < config.prayerCount; i++)
                config.prayerDescription[i] = this.getString();

            for (var i = 0; i < config.prayerCount; i++)
                config.prayerLevel[i] = this.getUnsignedByte();

            for (var i = 0; i < config.prayerCount; i++)
                config.prayerDrain[i] = this.getUnsignedByte();


            return config;
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
            console.log("returning null");
            return null;
        },
        getUnsignedInt: function () {
            var i = this.intData.getUint32(this.intOffset);
            this.intOffset += 4;
            return i;
        },
        getUnsignedByte: function () {
            return this.intData.getInt8(this.intOffset++);
        },
        getString: function () {
            var i = this.stringData.getInt8(this.stringOffset++);
            var str = "";
            while (i != 0) {
                str += String.fromCharCode(i);
                i = this.stringData.getInt8(this.stringOffset++);
            }

            return str;
        },
        getUnsignedShort: function () {

            var i = this.intData.getUint16(this.intOffset, false);
            this.intOffset += 2;
            return i;
        },
        peek: function (offset) {
            var a = this.intData.getInt8(offset);
            return a;
        },
        peek8: function (offset) {
            var a = this._data.getInt8(offset);
            return a;
        },

        read8: function () {
            var a = this._data.getInt8(this._ptr);
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
