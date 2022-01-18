if(!String.prototype.includes){//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	String.prototype.includes = function(search,start){
		'use strict';
		if(search instanceof RegExp){
			throw TypeError('first argument must not be a RegExp');
		} 
		if(start === undefined){
			start = 0
		}
		return this.indexOf(search,start) !== -1;
	}
}

//https://github.com/JSmith01/broadcastchannel-polyfill
//The Unlicense
if(!window.BroadcastChannel){
    var channels = [];

    const BroadcastChannel = function(channel) {
        var $this = this;
        channel = String(channel);

        var id = '$BroadcastChannel$' + channel + '$';

        channels[id] = channels[id] || [];
        channels[id].push(this);

        this._name = channel;
        this._id = id;
        this._closed = false;
        this._mc = new MessageChannel();
        this._mc.port1.start();
        this._mc.port2.start();

        window.addEventListener('storage', function(e) {
            if (e.storageArea !== window.localStorage) return;
            if (e.newValue == null || e.newValue === '') return;
            if (e.key.substring(0, id.length) !== id) return;
            var data = JSON.parse(e.newValue);
            $this._mc.port2.postMessage(data);
        });
    }

    BroadcastChannel.prototype = {
        // BroadcastChannel API
        get name() {
            return this._name;
        },
        postMessage: function(message) {
            var $this = this;
            if (this._closed) {
                var e = new Error();
                e.name = 'InvalidStateError';
                throw e;
            }
            var value = JSON.stringify(message);

            // Broadcast to other contexts via storage events...
            var key = this._id + String(Date.now()) + '$' + String(Math.random());
            window.localStorage.setItem(key, value);
            setTimeout(function() {
                window.localStorage.removeItem(key);
            }, 500);

            // Broadcast to current context via ports
            channels[this._id].forEach(function(bc) {
                if (bc === $this) return;
                bc._mc.port2.postMessage(JSON.parse(value));
            });
        },
        close: function() {
            if (this._closed) return;
            this._closed = true;
            this._mc.port1.close();
            this._mc.port2.close();

            var index = channels[this._id].indexOf(this);
            channels[this._id].splice(index, 1);
        },

        // EventTarget API
        get onmessage() {
            return this._mc.port1.onmessage;
        },
        set onmessage(value) {
            this._mc.port1.onmessage = value;
        },
        addEventListener: function(/*type, listener , useCapture*/) {
            return this._mc.port1.addEventListener.apply(this._mc.port1, arguments);
        },
        removeEventListener: function(/*type, listener , useCapture*/) {
            return this._mc.port1.removeEventListener.apply(this._mc.port1, arguments);
        },
        dispatchEvent: function(/*event*/) {
            return this._mc.port1.dispatchEvent.apply(this._mc.port1, arguments);
        },
    };

    window.BroadcastChannel = window.BroadcastChannel || BroadcastChannel;
}

/**
 * Array.flat() polyfill
 * Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#reduce_concat_isArray_recursivity
 */
if (!Array.prototype.flat) {
	Array.prototype.flat = function(depth) {

		'use strict';

		// If no depth is specified, default to 1
		if (depth === undefined) {
			depth = 1;
		}

		// Recursively reduce sub-arrays to the specified depth
		var flatten = function (arr, depth) {

			// If depth is 0, return the array as-is
			if (depth < 1) {
				return arr.slice();
			}

			// Otherwise, concatenate into the parent array
			return arr.reduce(function (acc, val) {
				return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
			}, []);

		};

		return flatten(this, depth);

	};
}

