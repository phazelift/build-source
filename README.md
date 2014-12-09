build-source
============
<br/>
***A structural design pattern for working with Gulp.***

Get rid of all the pipe's, gulp.src's, gulp.dest's etc.. make it more readable and coherent.

<br/>
___

Given the following extremely basic directory structure to keep it short:

```javascript
source/
	index.html
	jade/
	css/
	coffee/
	js/
		lib/

build/
	index.html
	html/
	css/
	js/
		lib/
```
We can write the following code to make it happen:

```coffeescript
gulp				= require 'gulp'
plug				= do require 'gulp-load-plugins'
[ build, source ]	= require 'build-source'

build.tasks

# gulp.task	id		gulp.src		gulp.dest
	lib:		[ 'js/lib/*.js', 'js/lib' ]

	index: [ 'index.html', '',
		plug.minifyHtml
	]

	jade: [ 'jade/*.jade', 'html',
		plug.jade,
		plug.minifyHtml
	]

	css: [ 'css/*.css', 'css',
		plug.autoprefixer,
		[ plug.cssmin, keepSpecialComments: 0 ]
	]

	coffee: [ 'coffee/*.coffee', 'js',
		plug.coffee,
		plug.uglify
	]

	minifyCoffee: [
		'coffee/*.coffee', 'js',
		plug.coffee,
		[ plug.concat, 'scripts.min.js' ],
		plug.uglify
	]

	webserver: [ build.root, '',
		[ plug.webserver,
			livereload	: true
			open			: true
			directoryListing	: true
		]
	]

	watch: -> source.watchAll()

	default: -> build.tasks.startAll()
```
Several plugins were used in the example, below the list that you can paste straight into your package.json
file if you want to play with it:
```json
"dependencies": {
    "build-source": "^0.1.0",
    "coffee-script": "^1.8.0",
    "event-stream": "^3.1.7",
    "gulp": "^3.8.10",
    "gulp-autoprefixer": "^2.0.0",
    "gulp-coffee": "^2.2.0",
    "gulp-concat": "^2.4.2",
    "gulp-cssmin": "^0.1.6",
    "gulp-jade": "^0.10.0",
    "gulp-load-plugins": "^0.7.1",
    "gulp-minify-html": "^0.1.7",
    "gulp-ruby-sass": "^0.7.1",
    "gulp-uglify": "^1.0.1",
    "gulp-webserver": "^0.8.7"
}
```
___

API
===

**object structure:**
```coffeescript
source	: <function>
	root		: <string>
	noRoot		: <string>
	watchable	: <boolean>
	watcher		: <object>
	watch		: <object>

build	:
	root		: <string>
	task		: <object>
		src			: <string>/<array>
		dest		: <string>
		plugs		: <array>
	tasks		: <function>
		ignore		: <array>
		ignored		: <boolean>
	 	startAll	: <function>
	source		: <object>
```
___

**source**
> `<gulp> source( <string>/<array> paths )`

Returns a gulp.src with path(s) mapped relative to source.root.
___

**source.root**
> `<string> source.root`

Holds the source root path. Defaults to 'source/', but can be set to any base path you prefer. You can also
set to an empty string '' if you don't want no base path at all.
___
**source.noRoot**
> `<string> source.noRoot`

noRoot can be prepended to a src string to prevent prepending source.root. Only necessary if source.root is
set (default).

noRoot defaults to '^'. I chose the caret because it is also used in regexp to denote that the following
characters need to be the start of the string, or the base path in our case. You could set noRoot to another
(single!) character, although I cannot find one good reason to do that.
___

**source.watchable**
> `<boolean> source.watchable( <string> id )`

Internally this relates to the watchAll method. All id's in build.tasks.ignore are not watchable, as well
as the 'default' and 'watch' tasks of course.
___

**source.watcher**
> `<object> source.watcher`

Holds all gulp.watch watchers that were set with source.watch.
___

**source.watch**
> `<gulp.watch> source.watch( <object> tasks )`

Uses gulp.watch to set multiple listeners in one call. source.watcher[ path ] holds the gulp.watch listener for
that specific path.
___

**source.watch.watchAll**
> `<function> source.watch.watchAll( )`

Runs source.watch for all watchable build.task id's.
___




**build**
> `<function> build( <string> path )`

Returns a build function that writes to the given path ralative to build.root.
___
**build.root**
> `<string> build.root`

Holds the build root path. Defaults to 'build/'.
___


**build.task[ id ]**
> `<function> build.task`

build.task[ id ] holds the actual method that runs the gulp.task with id. Besides you can manually run the
task if needed, there are also three properties bound to the function:

- src
- dest
- plugs

See the description below for their contents.
___

**build.task[ id ].src**
> `<string> build.task[ id ].src`

Holds the src for id, which can be a single string or an array of strings.
___

**build.task[ id ].dest**
> `<string> build.task[ id ].dest`

Holds the dest or the write path for id.
___

**build.task[ id ].plugs**
> `<array> build.task[ id ].plugs`

Holds all the plugs for id in an array, including their possible arguments.
___

**build.tasks**
> `<undefined> build.tasks( <object> tasks )`

build.tasks is the main function to call for creating your tasks. It takes an object where:

- you can add tasks as build-source style arrays

```coffeescript
#	id		gulp.src		gulp.dest	plug1,	...,			plugN		plug-arguments
	jade: [ 'jade/*.jade', 'html',		jade, 	minifyHtml, [concat, 'all.html'] ]

# normally written as:
build.tasks

	jade: [ 'jade/*.jade', 'html',
		jade,
		minifyHtml,
		[ concat, 'all.html' ]
	]
```
- or the default function way, except for that the key remains the id of the gulp.task, so you don't need
to write that:
```coffeescript
build.tasks

	jade: ->
		gulp.src 'jade/*.jade'
		.pipe jade()
		.pipe minifyHtml()
		.pipe concat 'all.html'
		.pipe gulp.dest 'html'
```
As in the example, if a plug needs to give arguments, you'll have to wrap the plug and argument(s) in an array,
where possible following arguments can be comma seperated as in a normal function call.
___

**build.tasks.ignore**
> `<array> build.tasks.ignore`

An empty array where you can add id's to, to prevent them from being fired by build.tasks.startAll.
You don't have to add 'default' as build-source will never call the 'default' task.
___

**build.tasks.ignored**
> `<boolean> build.tasks.ignored( <string> id )`

Used internally. You can call to find out if an id is in the ignore list or it is 'default'.
___

**build.tasks.startAll**
> `<undefined> build.tasks.startAll()`

Starts all gulp tasks created with build.tasks that are not ignored.
___

**build.source**
> `<function> build.source( <string>/<array> paths )`

An alias to make available source, in case you're not using Coffeescript.

___

change log
==========

**0.1.0**

Initial commit.

___
**additional**

I am always open for feature requests or any feedback. You can reach me at Github.