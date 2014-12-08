// Generated by CoffeeScript 1.8.0
(function() {
  "use strict";
  var build, gulp, mapRoot, source, _,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  gulp = require('gulp');

  _ = require('words.js');

  mapRoot = function(paths, root) {
    if ('' !== _.forceString(root)) {
      paths = _.flexArgs(paths);
      paths = paths.map(function(path) {
        return root + path;
      });
    }
    return paths;
  };

  source = function(src) {
    if (src) {
      return gulp.src(mapRoot(src, source.root));
    }
  };

  source.root = 'source/';

  source.watchable = function(id) {
    return !((build.tasks.ignored(id)) || (id === 'watch'));
  };

  source.watch = function(tasks) {
    var id, path, _results;
    _results = [];
    for (path in tasks) {
      id = tasks[path];
      if (source.watchable(id)) {
        _results.push(source.watch[path] = gulp.watch(source.root + path, id));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  source.watch.tasks = {};

  source.watch.addTask = function(id, src) {
    if (source.watch.tasks.hasOwnProperty(src)) {
      return source.watch.tasks[src].push(id);
    } else {
      if (src) {
        return source.watch.tasks[src] = [id];
      }
    }
  };

  source.watchAll = function() {
    return source.watch(source.watch.tasks);
  };

  build = function(dest) {
    return function(src, plugins) {
      var args, data, plugin, _i, _len, _ref;
      data = source(src);
      for (_i = 0, _len = plugins.length; _i < _len; _i++) {
        plugin = plugins[_i];
        if (plugin) {
          if (_.notFunction(plugin)) {
            _ref = plugin, plugin = _ref[0], args = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
            data = data.pipe(plugin.apply(this, args));
          } else {
            data = data.pipe(plugin());
          }
        }
      }
      return data.pipe(gulp.dest(build.root + dest));
    };
  };

  build.root = 'build/';

  build.task = {};

  build.tasks = function(tasks) {
    var id, task, _results;
    _results = [];
    for (id in tasks) {
      task = tasks[id];
      _results.push((function(id, task) {
        var dest, plugs, src;
        if (_.isFunction(task)) {
          build.task[id] = task;
          gulp.task(id, task);
        } else if (_.isArray(task)) {
          src = task[0], dest = task[1], plugs = 3 <= task.length ? __slice.call(task, 2) : [];
          build.task[id] = function() {
            return build(dest)(src, plugs);
          };
          build.task[id].src = src;
          build.task[id].dest = dest;
          build.task[id].plugs = plugs;
          gulp.task(id, build.task[id]);
          source.watch.addTask(id, src);
        }
        return build.tasks.add(id);
      })(id, task));
    }
    return _results;
  };

  build.tasks.ignore = [];

  build.tasks.ignored = function(id) {
    return (__indexOf.call(build.tasks.ignore, id) >= 0) || (id === 'default');
  };

  build.tasks.all = [];

  build.tasks.add = function(id) {
    if (!build.tasks.ignored(id)) {
      return build.tasks.all.push(id);
    }
  };

  build.tasks.run = function() {
    return gulp.start(build.tasks.all);
  };

  module.exports = [build, source];

}).call(this);
