(function(ns) {
	// TODO: close stream
	function TitaniumReaderData(filename) {
		this.file=Titanium.Filesystem.getFile(filename);
		this.stream=Titanium.Filesystem.getFileStream(this.file);
		this.stream.open(Titanium.Filesystem.MODE_READ,true);
	}

	TitaniumReaderData.prototype= {
		loadRange: function(range,callback,errCallback) {
			//TODO: check!
			callback();
		},
		getStringAt: function(offset,length) {
			this.stream.seek(offset,Titanium.Filesystem.SEEK_START);
			return this.stream.read(length).toString();
		},
		getLongAt: function(offset,bigEndian) {
			var iByte1 = this.getByteAt(offset),
			iByte2 = this.getByteAt(offset + 1),
			iByte3 = this.getByteAt(offset + 2),
			iByte4 = this.getByteAt(offset + 3);

			var iLong = bigEndian ?
			(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
			if (iLong < 0)
				iLong += 4294967296;
			return iLong;
		},
		getInteger24At: function(iOffset, bBigEndian) {
			var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2);

			var iInteger = bBigEndian ?
			((((iByte1 << 8) + iByte2) << 8) + iByte3)
			: ((((iByte3 << 8) + iByte2) << 8) + iByte1);
			if (iInteger < 0)
				iInteger += 16777216;
			return iInteger;
		},
		getByteAt: function(offset) {
			this.stream.seek(offset,Titanium.Filesystem.SEEK_START);
			return this.stream.read(1).byteAt(0);
		},
		getBytesAt : function(iOffset, iLength) {
			var bytes = new Array(iLength);
			for( var i = 0; i < iLength; i++ ) {
				bytes[i] = this.getByteAt(iOffset+i);
			}
			return bytes;
		},
		isBitSetAt: function(iOffset, iBit) {
			var iByte = this.getByteAt(iOffset);
			return (iByte & (1 << iBit)) != 0;
		},
		getStringWithCharsetAt: function(iOffset, iLength, iCharset) {
			var bytes = this.getBytesAt(iOffset, iLength);
			var sString;

			switch( iCharset.toLowerCase() ) {
				case 'utf-16':
				case 'utf-16le':
				case 'utf-16be':
					sString = StringUtils.readUTF16String(bytes, iCharset);
					break;

				case 'utf-8':
					sString = StringUtils.readUTF8String(bytes);
					break;

				default:
					sString = StringUtils.readNullTerminatedString(bytes);
					break;
			}

			return sString;
		},
		getLength: function() {
			return this.file.size();
		}
	};

	function TitaniumReader(file,callback,errCallback) {
		//TODO: CHECK!
		callback(new TitaniumReaderData(file));
	}

	ns.TitaniumReader=TitaniumReader;
})(this);