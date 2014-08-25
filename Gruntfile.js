module.exports = function(grunt) {

  // LOAD ALL GRUNT TASKS
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    browserify: {
      account_dev: {
        options: {
          debug: true
        },
        files: {
          'production/js/app.js': ['tmp/js/app.js']
        }
      }
    },

    react: {
      client: {
        files: [{
          expand: true,
          cwd: 'app/js',
          src: ['**/*.js', '**/*.jsx'],
          dest: 'tmp/js',
          ext: '.js'
        }]
      },
    },

    sass: {
      dist: {
        files: {
          'tmp/css/app.css': 'app/scss/app.scss'
        }
      }
    },

    autoprefixer: {
      production: {
        src: 'tmp/css/app.css',
        dest: 'production/css/app.css'
      }
    },

    clean: ["tmp"],

    copy: {
      html: {
        files: [{
          expand: true,
          cwd: 'app/html',
          src: ['**/*'],
          dest: 'production'
        }]
      },
      bower: {
        files: [{
          expand: true,
          cwd: '.',
          src: ['bower_components/**/*'],
          dest: 'production'
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: ['**/*'],
          dest: 'production/images'
        }]
      },
      chrome: {
        files: [{
          expand: true,
          cwd: 'production',
          src: ['**/*', '!index.html'],
          dest: 'chrome-extension/panes'
        }]
      }
    },

    connect: {
      livereload: {
        options: {
          port: 8000,
          livereload: 35729, // change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost',
          base: 'production',
          open: true
        }
      }
    },

    watch: {

      options: {
        debounceDelay: 250
      },

      sass: {
        files: ['app/scss/**/*.scss'],
        tasks: ['sass', 'autoprefixer', 'copy:chrome']
      },

      js: {
        files: ['app/js/**/*'],
        tasks: ['react', 'browserify', 'copy:chrome']
      },

      html: {
        files: ['app/html/**/*'],
        tasks: ['copy:html', 'copy:chrome']
      },

      livereload: {
        options: {
          livereload: '<%= connect.livereload.options.livereload %>'
        },
        files: [
          'app/scss/**/*.scss',
          'app/js/**/*',
          'app/html/**/*'
        ]
      }

    }

  });

  grunt.registerTask('build', ['sass', 'autoprefixer', 'react', 'browserify', 'copy:html', 'copy:bower', 'copy:images', 'clean']);
  grunt.registerTask('chrome', ['build', 'copy:chrome']);

  //DEVELOPMENT FOR WEB PLATFORM
  grunt.registerTask('server', ['build', 'copy:chrome', 'connect', 'watch']);

  //DEFAULT TASK ($ grunt) builds app and chrome extention
  grunt.registerTask('default', ['sass', 'autoprefixer', 'react', 'browserify', 'copy:html', 'copy:bower', 'copy:images', 'clean', 'copy:chrome']);
};
