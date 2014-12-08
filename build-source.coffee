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


#	object structure:
#
#	source <function>
#		root <string>
#		watchable <function>
#		watch	<function>
#			[ path ] <gulp.watch>
#			tasks <object>
#				[ src ] <array>
#			addTask
#		watchAll <function>
#
#
#	build	<function>
#		root <string>
#		task <object>
#			[ id ] <build>
#				src <array>/<string>
#				target <array>/<string>
#				plugs <function>
#		tasks <function>
#			ignore <array>
#			ignored <function>
#			all <object>
#			allIds <array>
#			add <function>
#		 	run <function>

"use strict"

gulp		= require 'gulp'
_			= require 'words.js'

mapRoot= ( paths, root ) ->

	if '' isnt _.forceString root
		paths= _.flexArgs paths
		paths= paths.map ( path ) -> root+ path

	return paths

#
#----------------------------------- source ------------------------------------------
#

source= ( src ) -> gulp.src mapRoot(src, source.root) if src

source.root	= 'source/'

source.watchable= ( id ) -> not (( build.tasks.ignored id ) or ( id is 'watch' ))

source.watch= ( tasks ) ->

	for path, id of tasks then if source.watchable id
		source.watch[ path ]= gulp.watch source.root+ path, id


source.watch.tasks= {}
source.watch.addTask= ( id, src ) ->

	if source.watch.tasks.hasOwnProperty src
		source.watch.tasks[ src ].push id
	else
		source.watch.tasks[ src ]= [ id ] if src


source.watchAll= -> source.watch source.watch.tasks

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
			source.watch.addTask id, src

		build.tasks.add id


build.tasks.ignore	= []
build.tasks.ignored= ( id ) -> ( id in build.tasks.ignore ) or ( id is 'default' )

build.tasks.all		= []
build.tasks.add		= ( id ) ->	build.tasks.all.push id if not build.tasks.ignored id

build.tasks.run		= -> gulp.start build.tasks.all

#
#-----------------------------------------------------------------------------------

module.exports= [ build, source ]