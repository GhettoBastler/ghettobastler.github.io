class ScratchFSK {
    constructor(runtime) {
        this.runtime = runtime;
    }
    
    getInfo() {
        return {
            "id": "sendFSK",
            "name": "Send FSK",
            "blocks": [
                        {
                            "opcode": "sendFSK",
                            "blockType": "command",
                            "text": "Send [data] as FSK",
                            "arguments": {
                                "data": {
                                    "type": "number",
                                    "defaultValue": 97,
                                },
                            }
                        },
                ],
        };
    }
    
    sendFSK({data}) {
        //NO BRAIN COPY PASTE FROM NEOCAT'S CODE
        var dataURI, audio;
        var utf8 = [0x7f] //Testing
        console.log(utf8);
        
        var sampleRate = 29400;
        var baud = 1225;
        var freqHigh = 7350;
        var freqLow  = 4900;
        var spb = sampleRate/baud; // 24 samples per bit
        var preCarrierBits = Math.ceil(sampleRate*40/1000/spb); // 49 bits
        var postCarrierBits = Math.ceil(sampleRate*5/1000/spb); // 6.125 bits => 7 bits
        var size = (preCarrierBits + postCarrierBits + 10*utf8.length) * spb;

        function chr8() {
                return Array.prototype.map.call(arguments, function(a){
                        return String.fromCharCode(a&0xff)
                }).join('');
        }
        function chr16() {
                return Array.prototype.map.call(arguments, function(a){
                        return String.fromCharCode(a&0xff, (a>>8)&0xff)
                }).join('');
        }
        function chr32() {
                return Array.prototype.map.call(arguments, function(a){
                        return String.fromCharCode(a&0xff, (a>>8)&0xff,(a>>16)&0xff, (a>>24)&0xff);
                }).join('');
        }


        var data = "RIFF" + chr32(size+36) + "WAVE" +
                        "fmt " + chr32(16, 0x00010001, sampleRate, sampleRate, 0x00080001) +
                        "data" + chr32(size);
        
        function pushData(freq, samples) {
                for (var i = 0; i < samples; i++) {
                        var v = 128 + 127 * Math.sin((2 * Math.PI) * (i / sampleRate) * freq);
                        data += chr8(v);
                }
        }
        pushData(freqHigh, preCarrierBits*spb);
        for (var x in utf8) {
                var c = (utf8[x] << 1) | 0x200;
                for (var i = 0; i < 10; i++, c >>>= 1)
                        pushData((c&1) ? freqHigh : freqLow, spb);
        }
        pushData(freqHigh, postCarrierBits*spb);
        
        if (size+44 != data.length) alert("wrong size: " + size+44 + " != " + data.length);
        
        this.runtime.audioEngine.decodeSoundPlayer(dataURI)
    }
}

(function() {
    var extensionInstance = new ScratchFSK(window.vm.extensionManager.runtime)
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
})()
