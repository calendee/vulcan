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
          'ja/app.js': ['tmp/**/*.js']
        }
      }
    },

    jsx: {
      client: {
        src: 'js/**/*/.jsx',
        dest: 'tmp/**/*.js',
      },
    },

    compass: {
      resources: {
        options: {
          sassDir: 'scss',
          cssDir: 'css',
          environment: 'production',
          outputStyle: 'expanded'
        }
      }
    },

    clean: ["tmp"]
  });

  // Default task(s).
  grunt.registerTask('default', ['compass', 'jsx', 'browserify', 'clean']);
};
