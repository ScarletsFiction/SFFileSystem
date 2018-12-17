/*
	SFFileSystem Library
	A library for accessing local file system for
	the current website on the browser

	https://github.com/ScarletsFiction/SFFileSystem
*/

function SFFileSystem(options){
	var scope = this;
	if(typeof LocalFileSystem === 'undefined')
		var LocalFileSystem = {TEMPORARY: 0, PERSISTENT: 1};

	scope.home = false;
	scope.storageLocation = '';
	scope.ready = false;
	scope.temporary = options.temporary === true;

	scope.FileErrorMessage = function(e){
		if(e.code === 1) return 'Not found';
		else if(e.code === 2) return 'Security error';
		else if(e.code === 3) return 'Aborted';
		else if(e.code === 4) return 'Not readable';
		else if(e.code === 5) return 'Encoding error';
		else if(e.code === 6) return 'Modification not allowed';
		else if(e.code === 7) return 'Invalid state';
		else if(e.code === 8) return 'Syntax error';
		else if(e.code === 9) return 'Invalid modification';
		else if(e.code === 10) return 'Storage space zero';
		else if(e.code === 11) return 'Type mismatch';
		else if(e.code === 12) return 'Path error';
		else if(e.code === 13) return 'Failed to load directory';
		else if(e.indexOf && e.indexOf('quota') !== -1) return 'Storage quota exceeded';
		else return 'Unknown error';
	}

	scope.validateFileName = function(fileName){
		if(typeof fileName !== "string") return fileName;
		return fileName.replace(/[<>:\"/\\|?*]/, "-");
	}

	// === Both ===
		var both_rename = function(name, callback, error){
			var temp = this;
			this.getParent(function(parent){
				temp.optMove(parent, name, function(entry){
					if(!callback) return;
					
					autoWrap(entry);
					callback(entry);
				}, error);
			});
		}

		var both_copyTo = function(path, rename, callback, error, moving){
			var temp = this;
			var run = function(dirEntry){
				temp[moving ? 'optMove' : 'optCopy'](dirEntry, rename, function(entry){
					if(!callback) return;
					
					autoWrap(entry);
					callback(entry);
				}, error);
			}

			if(typeof path === 'string')
				scope.path(path, function(entry){
					run(entry);
				}, false, false, this);
			else run(path);
		}

		var both_moveTo = function(path, rename, callback, error){
			both_copyTo.apply(this, [path, rename, callback, error, true]);
		}

		var both_getParent = function(callback, error){
			this.optParent(function(entry){
				autoWrap(entry);
				callback(entry);
			}, error);
		}

		function autoWrap(entry){
			if(entry.isFile)
				wrapFileType(entry);
			else
				wrapDirectoryType(entry);
		}

	// === File ===
		var file_write = function(blob, callback, error, append){
			this.createWriter(function(fileWriter){
   				var truncated = false;
				fileWriter.onwriteend = function(e){
            		if(!append && !truncated){
            			this.truncate(this.position);
            			truncated = true;
            			return;
            		}
            		if(callback) callback(e);
				};
				fileWriter.onerror = error;

				if(typeof blob === "string")
					blob = new Blob([blob], {type:'text/plain'});

				fileWriter.seek(0);
				fileWriter.write(blob);
			}, error);
		}

		var file_append = function(blob, callback, error){
			file_write.apply(this, [blob, callback, error, true]);
		}

		var file_read = function(callback, error){
			this.file(function(file){
				var reader = new FileReader();

		        reader.onloadend = function() {
		            if(callback) callback(this.result);
		        };

		        reader.readAsText(file);
			});
		}

		// remove
		function wrapFileType(fileEntry){
			fileEntry.write = file_write;
			fileEntry.append = file_append;
			fileEntry.read = file_read;

			fileEntry.optCopy = fileEntry.copyTo;
			fileEntry.optMove = fileEntry.moveTo;
			fileEntry.optParent = fileEntry.getParent;
			fileEntry.rename = both_rename;
			fileEntry.copyTo = both_copyTo;
			fileEntry.moveTo = both_moveTo;
			fileEntry.getParent = both_getParent;
		}

	// === Directory ===
		var dir_newFolder = function(name, callback, error){
			this.optDirectory(name, {create:true, exclusive:false}, function(entry){
				if(!callback) return;

				wrapDirectoryType(entry);
				callback(entry);
			}, error);
		}

		var dir_newFile = function(name, callback, error){
			this.optFile(name, {create:true, exclusive:false}, function(entry){
				if(!callback) return;
				
				wrapFileType(entry);
				callback(entry);
			}, error);
		}

		var dir_getFolder = function(name, callback, error){
			this.optDirectory(name, null, function(entry){
				if(!callback) return;
				
				wrapDirectoryType(entry);
				callback(entry);
			}, error);
		}

		var dir_getFile = function(name, callback, error){
			this.optFile(name, null, function(entry){
				if(!callback) return;
				
				wrapFileType(entry);
				callback(entry);
			}, error);
		}

		var dir_exist = function(name, callback){
			var currentEntry = this;
			currentEntry.optFile(name, {create: false}, function(){
				callback('file');
			}, function(){
				currentEntry.optDirectory(name, {create: false}, function(){
					callback('folder');
				}, function(){
					callback(false);
				});
			});
		}

		var dir_contents = function(callback, error){
			var directoryReader = this.createReader();
			directoryReader.readEntries(function(entries){
				if (entries.length == 0)
					callback([]);
				else{
					for (var i = 0; i < entries.length; i++) {
						if(entries[i].isFile)
							wrapFileType(entries[i]);
						else wrapDirectoryType(entries[i]);
					}

					//entries = [{isFile, isDirectory, name, filesystem, nativeURL}]
					callback(entries);
				}
			}, error);
		}

		var dir_list = function(callback, error){
			var directoryReader = this.createReader();
			directoryReader.readEntries(function(entries){
				if (entries.length == 0)
					callback([]);
				else{
					var temp = [];
					for (var i = 0; i < entries.length; i++) {
						temp.push(entries[i].name);
					}

					callback(temp);
				}
			}, error);
		}

		var dir_dive = function(path, create, callback, error){
			scope.path(path, callback, error, create, this);
		}

		// removeRecursively, remove
		function wrapDirectoryType(dirEntry){
			dirEntry.optDirectory = dirEntry.getDirectory;
			dirEntry.optFile = dirEntry.getFile;
			delete dirEntry.getDirectory;

			dirEntry.newFolder = dir_newFolder;
			dirEntry.newFile = dir_newFile;
			dirEntry.getFolder = dir_getFolder;
			dirEntry.getFile = dir_getFile;
			dirEntry.exist = dir_exist;
			dirEntry.contents = dir_contents;
			dirEntry.list = dir_list;
			dirEntry.dive = dir_dive;

			dirEntry.optCopy = dirEntry.copyTo;
			dirEntry.optMove = dirEntry.moveTo;
			dirEntry.optParent = dirEntry.getParent;
			dirEntry.rename = both_rename;
			dirEntry.copyTo = both_copyTo;
			dirEntry.moveTo = both_moveTo;
			dirEntry.getParent = both_getParent;
		}

	scope.path = function(path, callback, error, create, dirEntry){
		if(path[0] === '/' || !dirEntry) dirEntry = scope.home;

		var directories = path.split('/').filter(function(folder){
			return folder !== '.' && !!folder;
		});

		for (var i = directories.length - 1; i >= 0; i--) {
			if(directories[i] === '..' && i !== 0){
				if(directories[i - 1] !== '..'){
					i--;
					directories.splice(i, 2);
				}
			}
		}

		if(directories.length === 0) return callback(dirEntry);

		var dirLevel = 0;
		var recursion = function(dirSys){
			if(directories[dirLevel] === '..'){
				dirLevel++;
				dirEntry.getParent(recursion);
				return;
			}
			dirSys.getDirectory(directories[dirLevel], {create:create, exclusive:false}, function(folderSystem){
				if(directories[dirLevel + 1]){
					dirLevel++;
					recursion(folderSystem);
				}
				else{
					wrapDirectoryType(folderSystem);
					callback(folderSystem);
				}
			}, error);
		};

		recursion(dirEntry);
	}

	scope.exist = function(path, callback){
		path = path.split('/');
		var name = path.pop();
		path = path.join('/');

		scope.path(path, function(entry){
			entry.exist(name, callback);
		}, function(){
			callback(false);
		});
	}

	scope.list = function(path, callback, error){
		scope.path(path, function(entry){
			entry.list(callback);
		}, error);
	}

	scope.contents = function(path, callback, error){
		scope.path(path, function(entry){
			entry.contents(callback);
		}, error);
	}
	
	// Initialize root directory
	;(function(){
		if(!window.requestFileSystem) window.requestFileSystem = window.webkitRequestFileSystem;
		if(!options.initError) options.initError = console.error;
	
		var initReady = function(){
			scope.ready = true;
			wrapDirectoryType(scope.home);
			if(options.callback)
				setTimeout(options.callback, 500);
		}
	
		var requestSystem = function(quota){
			window.requestFileSystem(LocalFileSystem[scope.temporary === true ? 'TEMPORARY':'PERSISTENT'], quota, function(fs){
				var initStart = false;
				if(typeof cordova !== 'undefined'){
					if(options.home && cordova.file.externalRootDirectory){
						initStart = true;
						window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dirEntry){
							dirEntry.getDirectory(options.home, {create:true}, function(subDirEntry){
								scope.home = subDirEntry;
								scope.storageLocation = "External Card";
								initReady();
							});
						}, options.initError);
					}
	
					else if(cordova.file.externalDataDirectory){
						initStart = true;
						window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dirEntry){
							scope.home = dirEntry;
							scope.storageLocation = "External Application Home";
							initReady();
						}, options.initError);
					}
				}
				
				if(!initStart){
					if(options.home){
						fs.root.getDirectory(options.home, {create:true}, function(subDirEntry){
							scope.home = subDirEntry;
							initReady();
						});
					}
					else {
						scope.home = fs.root;
						initReady();
					}
					scope.storageLocation = "Internal Application Home";
				}
			}, options.initError);
		}
	
		var quota = (typeof device !== 'undefined' && device.platform !== 'browser') ? 0 : (1024*1024*1024*1024);

		// Executed on browser
		if(quota !== 0) return requestSystem(quota);
	
		// Executed on deployed cordova
		navigator.webkitPersistentStorage.requestQuota(quota, function(grantedBytes){
			self.grantedBytes = grantedBytes;
			requestSystem(0);
		}, options.initError);
	})();
}