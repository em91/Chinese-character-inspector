var fs = require( "fs" );

var root, recursive, exclusive, format;

var help = "\n\
Usage: node i18n.js [arguments]\n\n\
 -d[dir] 	要搜索的文件夹路径\n\
 -r[recursive]  递归查找\n\
 -e[exclusive] 	跳过的文件名称，逗号分隔\n\
 -f[format] 	要搜索的文件格式，逗号分隔\n\
\n\
Example: node i18n -root dir -r -exclusive test.js -f js,ftl\n";


process.argv.forEach(function( val, index, array ){
	if( val.indexOf( "-d" ) === 0 ){
		root = process.argv[ index + 1 ] || "";
	} else if ( val.match( /^(-r|-R)$/ ) ){
		recursive = true;
	} else if ( val.indexOf( "-e" ) === 0 ){
		exclusive = process.argv[ index + 1 ] || "";
	} else if ( val.indexOf( "-f" ) === 0 ){
		format = process.argv[ index + 1 ] || "";
	}
})


if( !root ){
	console.error( "Error: directory required." );
	console.info( help );
	process.exit();
}

recursive = recursive === true ? true : false;
exclusive = ( exclusive || "" ).split( "," );
format = ( format || "" ).split( "," );


function ls( root, recursive ){
	var fileList = [], 
		files = fs.readdirSync( root );

	files.forEach(function( filename ){
		if( exclusive.indexOf( filename ) > -1 ){
			return false;
		}
		var pathname = root + "/" + filename;
		var stat = fs.lstatSync( pathname );

		if( !stat.isDirectory() ){
			var suffix = filename.slice( filename.lastIndexOf(".") + 1 );
			if( !format || format.indexOf( suffix ) > -1 ){
				fileList.push( pathname );
			}
		} else if( recursive ) {
			fileList = fileList.concat( ls( pathname, recursive ) );
		}
	})

	return fileList;
}

var files = ls( root, recursive );

var length = 0, fileMap = {}, trim;

files.forEach(function( file ){
	var lines = fs.readFileSync( file ).toString().split("\n");

	for( var i = 0, l = lines.length, line, temp; i < l; i++ ){
		line = lines[i];

		trim = line.trim();
		if( file.match(/\.js$/) ){
			//匹配 //xxx 整合注释  /* 单行开头注释 <!-- HTML字符串注释
			if( trim.match( /^(\/\/|\/\*|\*|<!--)/ ) ){
				continue;
			}

			//匹配  xxx //comment
			if( trim.match( /^[^\u4E00-\u9FA5\uF900-\uFA2D]*\/\/(.*)$/ ) ){
				continue;
			}
		} else if ( file.match(/\.ftl$/) ){

			//匹配 <!--  和 <#--
			if( trim.match(/^<(#|!)--(.*)$/) ){
				continue;
			}

			//匹配注释中的汉字
			if( trim.match(/^[^\u4E00-\u9FA5\uF900-\uFA2D]*<(#|!)--(.*)-->[^\u4E00-\u9FA5\uF900-\uFA2D]*$/) ){
				continue;
			}
		}

		//干掉单行注释
		temp = line.split( "//" )[0];

		if( ( /[\u4E00-\u9FA5\uF900-\uFA2D]+/g.test(temp) ) ){
			console.log( file, ":", i, ":", trim );
			length++;

			if( !fileMap[file] ){
				fileMap[file] = 0;
			}

			fileMap[file]++;

			continue;
		}
	}

	if( fileMap[file] ){
		console.log( "\n" );
	}
})

console.log( "\n\n========" );

for( var file in fileMap ){
	console.log( file.slice( file.lastIndexOf("/") + 1 ), fileMap[file] );
}
	
console.log( "共", length, "行" );