var fs = require('fs');
var path = require('path');
var mm = require('musicmetadata'); //metadata 
var md5 = require('MD5');
var fse = require('fs-extra'); //for new directory creation
var crypto = require('crypto'); //for hash
var jf = require('jsonfile');


var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

var cpy = function(oldDir, newDir){ //new file or directory creation
  fse.copy(oldDir, newDir, function(err){
    if (err) return console.error(err);
  }); 

}


var md5 = function(string){ //data encryption
  return crypto.createHash("md5").update('' + string).digest('hex');
}

walk(process.argv[2], function(err, results) {
  if (err) throw err;
  var x = 0
      , files = [], //json that will accet the data to be return
      y = 0;
  for(x = 0 ; x < results.length ; x++) {
      (function(resultVal) {
          var parser = mm(fs.createReadStream(resultVal), { duration: true });
        
         parser.on('metadata', function (result) {
          file_name = path.basename(resultVal);

            if(file_name != ".DS_Store" && file_name != "._.DS_Store"){
              real_file_name = file_name;
              file_path = path.dirname(resultVal) + "/";
              fixed_file_path = file_path + real_file_name;
              
              //start of file path incryption
              file_split = file_path.split("/");
              encrypted_file_path = "";
              file_split.forEach(function(e){
                encrypted_file_path += md5(e)  + "/";
                //file path chopped and encryted separately
              });
              
              //start of filename encryption
              temp_file_name = file_name.split(".");
              extension = temp_file_name[temp_file_name.length - 1]; //extension needs to be removed from the file name and added later
              temp_file_name.length = temp_file_name.length - 1; //deletion of .mp3 from the file name
              file_name = md5(temp_file_name) + "." + extension; //adding of file name extension to encrypted filename
              //end of file name encryption
              encrypted_file_path = encrypted_file_path.substring(0, encrypted_file_path.length-2);
              encrypted_file_path = encrypted_file_path + file_name;
              //end of file path encryption
              file_size = resultVal;
              temp_res = resultVal;
              temp_dir = temp_res.split("/");

              if(temp_dir[3] != file_name)
                version = temp_dir[3];
              else
                version = "";
              var duration_converted = parseInt(result['duration'] / 60);
              duration_converted = duration_converted + ":" + result['duration'] % 60; //conversion of seconds to minutes for duration
        
              var stats = fs.statSync(file_size);
              var fileSizeInBytes = (stats["size"]/1000000).toFixed(2) + " MB"; //conversion of bytes to MB
        
              files[y] = { "song_name" : result['title'],
                            "file_path" : encrypted_file_path,
                            "file_name" : file_name,
                            "real_file_name" : real_file_name,
                            "album_name" : result['album'],
                            "version" : version,
                            "artist_name" : result['artist'],
                            "genre" : result['genre'],
                            "duration" : duration_converted,
                            "file_size" : fileSizeInBytes }; //passing or storing of json
              y++;
              cpy(fixed_file_path, encrypted_file_path);
            }


            var file = 'musicdata.json'

            jf.writeFile(file, files, function(err) {
            });
          });

      })(results[x]);
    
  }
});


