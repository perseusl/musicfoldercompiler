Install the modules required by running the following commands:

npm install --save fs-extra
npm install jsonfile --save
npm install MD5
npm install musicmetadata

File usage:

node musicfoldercompiler.js <music root directory>

e.g.
fixt(music folder attached here)
node musicfoldercompiler.js fixt


Music Directory Structure:
root(directory)
	-artist(directory)
		-albums(directory)
			-songs(mp3 file)
			-versions(directory) //not all albums have versions
				-songs(mp3 file).
				