build-source
============

# DEPRECATED AND ABANDONED

A structural design pattern for working with Gulp.

Get rid of all the pipe's, gulp.src's, gulp.dest's etc.. make it more readable and coherent.

___

Given A basic directory structure

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
We can write the following code to make it happen

```coffeescript
gulp				= require 'gulp'
plug				= do require 'gulp-load-plugins'
[ build, source ]	= require 'build-source'

source.root	= 'source/'
build.root	= 'build/'

build.tasks

	lib: [ 'js/lib/*.js', 'js/lib' ]

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

	minifyCoffee: [ 'coffee/*.coffee', 'js',
		plug.coffee,
		[ plug.concat, 'scripts.min.js' ],
		plug.uglify
	]

	webserver: [ '^build/', '!', [
		plug.webserver,
			livereload	: true
			open			: true
			directoryListing	: true
	] ]

	watch: -> source.watchAll()

	default: -> build.tasks.startAll()
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

build	: <function>
	root		: <string>
	task		: <object>
		src			: <string>/<array>
		dest		: <string>
		plugs		: <array>
	tasks		: <function>
		all			: <array>
		ignore		: <array>
		ignored		: <boolean>
	 	startAll	: <function>
	source		: <object>
```
___

source
======


**source**
> `<gulp> source( <string>/<array> paths )`

Returns a gulp.src with path(s) mapped relative to source.root.
___
**source.root**
> `<string> source.root`

Holds the source root path. Defaults to '', which means having no effect, but can be set to any base path you
prefer.
___
**source.noRoot**
> `<string> source.noRoot`

noRoot can be prepended to a src string to momentary prevent prepending source.root. Only necessary if source.root
is set (default).

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
**source.watchAll**
> `<function> source.watchAll( )`

Runs source.watch for all watchable build.task id's.
___

build
=====


**build**
> `<function> build( <string> path )`

Returns a build function that writes to the given path ralative to build.root.
```coffeescript
toLib= build 'build/js/lib'

build.tasks
	default: -> toLib 'lib/*.js'
# copies all .js files from ./js/lib to ./build/js/lib
```
___
**build.root**
> `<string> build.root`

Holds the build root path. Defaults to '', which means having no effect, but can be set to any base path you
prefer.
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
> `<string>/<array> build.task[ id ].src`

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

- you can add tasks as build-source style arrays, having the following format:

gulp.src	|gulp.dest	| plugins...
---------|-----------|-------------------------
where the object key represents the gulp.task:
```coffeescript
build.tasks

	jade: [ 'jade/*.jade', 'html',
		jade,
		minifyHtml,
		[ concat, 'all.html' ]
	]
```
- or the default function way, except for that the key remains the id of the gulp.task.
```coffeescript
build.tasks

	jade: ->
		gulp.src 'jade/*.jade'
		.pipe jade()
		.pipe minifyHtml()
		.pipe concat 'all.html'
		.pipe gulp.dest 'html'
```
When using the array format:
- you can use the caret ^ for inhibiting the build.root or source.root
- you can use the exclamation mark ! in the gulp.dest field to prevent outputting to gulp.dest, it simply means:
	no output. As a result, you cannot write to a directory called !
- if a plug needs arguments, you'll have to wrap the plug and argument(s) in an array, where possible following
	arguments can be comma seperated as in a normal function call.

```javascript
build.tasks

	# ^ means: ignore source.root and use build/ as source path for the webserver
	# ! means: no output to file
	webserver: [ '^build/', '!', [
		plug.webserver,
			livereload	: true
			open		: true
	] ]

```
___
**build.tasks.all**
> `<array> build.tasks.all`

Contains all id's of the tasks added with build.tasks.
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
**0.3.5**

Added the option for putting a '!' in the "src.dest" field. Now you can use processing without output
to a file, as needed for certain plugs like gulp-webserver for example.

___
**0.3.1**

Fixed: Custom build function now doesn't crash anymore when no plugins are given.

I removed the presets for source.root and build.root. Now you can run a build without first creating a ./source dir
or setting source.root to some other path. They can of course still be set manually if you liked the idea.
___
**0.3.0**

Fixed: missing Strings error

Added: build.tasks.all
___
**0.1.0**

Initial commit.

___
**additional**

I am always open for feature requests or any feedback. You can reach me at Github.