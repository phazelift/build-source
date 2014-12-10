(function() {
  "use strict";
  var Strings, build, gulp, mapRoot, source, _,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  gulp = require('gulp');

  _ = require('words.js');

  Strings = _.Strings;

  mapRoot = function(paths, root) {
    if ('' !== _.forceString(root)) {
      paths = _.flexArgs(paths);
      paths = paths.map(function(path) {
        if (Strings.startsWith(path, source.noRoot)) {
          return Strings.removePos(path, 1);
        }
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

  source.noRoot = '^';

  source.watchable = function(id) {
    return !((build.tasks.ignored(id)) || (id === 'watch'));
  };

  source.watcher = {};

  source.watch = function(tasks) {
    var id, path, _results;
    _results = [];
    for (path in tasks) {
      id = tasks[path];
      if (source.watchable(id)) {
        _results.push(source.watcher[path] = gulp.watch(mapRoot(path, source.root), id));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  source.watchAll = function() {
    var id, obj, tasks, _ref;
    tasks = {};
    _ref = build.task;
    for (id in _ref) {
      obj = _ref[id];
      if (!obj.src) {
        continue;
      }
      if (tasks[obj.src] != null) {
        tasks[obj.src].push(id);
      } else {
        tasks[obj.src] = [id];
      }
    }
    return source.watch(tasks);
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
        }
        return build.tasks.all.push(id);
      })(id, task));
    }
    return _results;
  };

  build.tasks.all = [];

  build.tasks.ignore = [];

  build.tasks.ignored = function(id) {
    return (__indexOf.call(build.tasks.ignore, id) >= 0) || (id === 'default');
  };

  build.tasks.startAll = function() {
    var id, tasks, _i, _len, _ref;
    tasks = [];
    _ref = build.tasks.all;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      if (!build.tasks.ignored(id)) {
        tasks.push(id);
      }
    }
    return gulp.start(tasks);
  };

  build.source = source;

  module.exports = [build, source];

}).call(this);
