<a href="https://www.patreon.com/stefansarya"><img src="http://anisics.stream/assets/img/support-badge.png" height="20"></a>

[![Written by](https://img.shields.io/badge/Written%20by-ScarletsFiction-%231e87ff.svg)](LICENSE)
[![Software License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=SFMediaStream%20is%20alibrary%20for%20playing%20media%20or%20stream%20microphone.&url=https://github.com/ScarletsFiction/SFMediaStream&via=github&hashtags=SFMediaStream,video,audio,playlist,stream,microphone)

# SFFileSystem
Extends functionality of modern browser FileSystem's API

## How to use
### Initialization
```js
var myFile = new SFFileSystem({ options });
```

### Options
| Property  | Details |
| --- | --- |
| home | Set the root folder |
| temporary | Store file to temporary storage that will vanish when the browser was refreshed |
| callback | Callback if the initialization was success |
| initError | Callback if the initialization was failed |

### Available Methods
#### home
This is the current root folder
```js
if(myFile.home.isDirectory === true)
    console.log("I'm a folder");

// For other usage please check the 'Directory Entry' and 'Both Entry'
```

#### path
Get directory entry from directory path
```js
myFile.path('/myFolder/subFolder', function(dirEntry){
    dirEntry.isDirectory === true
}, console.error);
```

#### exist
Check if file/folder was exist and return the type of the target
```js
myFile.exist('/myFolder/subFolder', function(exist){
    if(exist === 'file' || exist === 'folder')
        console.log(true);
    else
        console.log(false);
}, console.error);
```

#### list
Get contents from a path and return an array of string
```js
myFile.list('/myFolder', function(list){
    list instanceof Array;
    // ['myFile.txt', 'myFolder']
});
```

#### contents
Get contents from a path and return their Entry
```js
myFile.contents('/myFolder', function(list){
    list instanceof Array;
    // The array values can either be FileEntry or DirectoryEntry
});
```


### Directory Entry
#### newFolder
#### newFile
#### getFolder
#### getFile
#### exist
#### contents
#### list
#### dive

### File Entry
#### write
Write blob or string to current file
```
fileEntry.write('string' || new Blob(['any'], {type:"text/plain"}));
```

#### append
Append blob or string to current file
```
fileEntry.append('string' || new Blob(['any'], {type:"text/plain"}));
```

#### read
Read current file as a string
```
fileEntry.read(function(value){
    console.warn(value);
});

// The alternative method is accessing the file from it's url
var url = fileEntry.toURL();
```

### Both Entry
#### remove
Rename current file/folder
```
anyEntry.remove();
dirEntry.removeRecursively();
```

#### rename
Rename current file/folder
```
anyEntry.rename('targetName');
```

#### copyTo
Copy current file/folder to other directory
```
anyEntry.copyTo('path' || DirectoryEntry);
```

#### moveTo
Move current file/folder to other directory
```
anyEntry.moveTo('path' || DirectoryEntry);
```

#### getParent
Get parent directory for current file/folder
```
anyEntry.getParent(function(dirEntry){
    dirEntry.isDirectory == true;
});
```

#### isFile
Return true is current entry is a file
```
if(anyEntry.isFile)
    console.log("I'm a file");
```

#### isDirectory
Return true is current entry is a folder
```
if(anyEntry.isDirectory)
    console.log("I'm a folder");
```

#### toURL
Return absolute URL of current file/folder
```
var url = anyEntry.toURL();
// url = filesystem:http://localhost/...
```

