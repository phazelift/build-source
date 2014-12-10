# build-source.coffee - styling the Gulp dialect
#
# Copyright (c) 2014 Dennis Raymondo van der Sluis
#
# This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with this program.  If not, see <http://www.gnu.org/licenses/>

"use strict"

gulp		= require 'gulp'
_			= require 'words.js'
Strings	= _.Strings

mapRoot= ( paths, root ) ->

	if '' isnt _.forceString root
		paths= _.flexArgs paths
		paths= paths.map ( path ) ->
			if Strings.startsWith path, source.noRoot
				return Strings.removePos path, 1
			return root+ path

	return paths

#
#----------------------------------- source ------------------------------------------
#

source= ( src ) -> gulp.src mapRoot(src, source.root) if src

source.root		= 'source/'
source.noRoot	= '^'

source.watchable= ( id ) -> not (( build.tasks.ignored id ) or ( id is 'watch' ))

source.watcher= {}
source.watch= ( tasks ) ->

	for path, id of tasks then if source.watchable id
		source.watcher[ path ]= gulp.watch mapRoot(path, source.root), id

source.watchAll= ->

	tasks= {}
	for id, obj of build.task

		continue if not obj.src

		if tasks[ obj.src ]?
			tasks[ obj.src ].push id
		else
			tasks[ obj.src ]= [ id ]

	source.watch tasks

#
#----------------------------------- build ------------------------------------------
#

build= ( dest ) ->

	( src, plugins ) ->

		data= source src

		for plugin in plugins then if plugin

			# allow for arguments in array form
			if _.notFunction plugin
				[ plugin, args... ]= plugin
				data= data.pipe plugin.apply @, args
			else
				data= data.pipe plugin()

		data.pipe gulp.dest build.root+ dest


build.root	= 'build/'
build.task	= {}

build.tasks= ( tasks ) ->

	for id, task of tasks then do ( id, task ) ->

		if _.isFunction task

			build.task[ id ]= task
			gulp.task id, task

		else if _.isArray task

			[ src, dest, plugs... ]	= task

			build.task[ id ]			= -> build( dest ) src, plugs
			build.task[ id ].src		= src
			build.task[ id ].dest	= dest
			build.task[ id ].plugs	= plugs

			gulp.task id, build.task[ id ]

		build.tasks.all.push id


build.tasks.all		= []
build.tasks.ignore	= []
build.tasks.ignored= ( id ) -> ( id in build.tasks.ignore ) or ( id is 'default' )

build.tasks.startAll	= ->

	tasks= []
	for id in build.tasks.all
 		tasks.push id if not build.tasks.ignored id

	gulp.start tasks


# make source available for JS
build.source= source

#
#-----------------------------------------------------------------------------------

module.exports= [ build, source ]