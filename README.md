### Chinese Character Inspector


检查JS和ftl中的汉字字符，用于检查项目I18N完善程度。

Usage: *node i18n.js [arguments]*

> -d[dir] 	要搜索的文件夹路径 

> -r[recursive]  递归查找 

> -e[exclusive] 	跳过的文件名称，逗号分隔 

> -f[format] 	要搜索的文件格式，逗号分隔 


Example: 
<pre><code>node i18n -d dir -r -exclusive test.js -f js,ftl</code></pre>