// Generated on 2013-09-19 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port : LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app : 'client-dev',
    dist : 'dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  grunt.initConfig({
    yeoman : yeomanConfig,
    less : {
      development : {
        options : {
          paths : ['<%= yeoman.app %>']
        },
        files : {
          '<%= yeoman.app %>/styles/core.css' : '<%= yeoman.app %>/less/core.less'
        }
      }
    },
    watch : {
      styles : {
        files : ['<%= yeoman.app %>/styles/{,*/}*.css', '<%= yeoman.app %>/less/{,*/}*.less'],
        tasks : ['less', 'copy:styles', 'autoprefixer']
      },
      livereload : {
        options : {
          livereload : LIVERELOAD_PORT
        },
        files : [
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.app %>/less/{,*/}*.less',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoprefixer : {
      options : ['last 10 version', 'ie 8', 'ie 7'],
      dist : {
        files : [
          {
            expand : true,
            cwd : '.tmp/styles/',
            src : '{,*/}*.css',
            dest : '.tmp/styles/'
          }
        ]
      }
    },
    connect : {
      options : {
        port : 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname : 'localhost'
      },
      livereload : {
        options : {
          middleware : function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      dist : {
        options : {
          middleware : function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open : {
      server : {
        url : 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean : {
      dist : {
        files : [
          {
            dot : true,
            src : [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server : '.tmp'
    },
    jshint : {
      options : {
        jshintrc : '.jshintrc'
      },
      all : [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,**/}*.js'
      ]
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
     dist: {}
     },*/
    rev : {
      dist : {
        files : {
          src : [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/fonts/*'
          ]
        }
      }
    },
    useminPrepare : {
      html : '<%= yeoman.app %>/index.html',
      options : {
        dest : '<%= yeoman.dist %>'
      }
    },
    usemin : {
      html : ['<%= yeoman.dist %>/{,*/}*.html'],
      css : ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options : {
        dirs : ['<%= yeoman.dist %>']
      }
    },
    imagemin : {
      dist : {
        files : [
          {
            expand : true,
            cwd : '<%= yeoman.app %>/images',
            src : '{,*/}*.{png,jpg,jpeg}',
            dest : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    svgmin : {
      dist : {
        files : [
          {
            expand : true,
            cwd : '<%= yeoman.app %>/images',
            src : '{,*/}*.svg',
            dest : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    cssmin : {
      options : {
        banner : '' +
          '/************************************************************************************* \n' +
          '                            ____                                                       \n' +
          '  ||                       ||   |                   ||            ||                   \n' +
          '  ||          ____   ___   ||   |  ___           ___||    ___     || //   ___          \n' +
          '  || \\\\    / //   | ||  |  ||___/ ||  | ||   |  /   || ||/   \\ || ||//  //   \\ \\\\    / \n' +
          '  ||  \\\\  /  ||   | ||     ||     ||    ||   |  |   || ||    | || ||\\\\  ||   |  \\\\  /  \n' +
          '  ||   \\\\/   \\\\___| ||     ||     ||    ||___|_ \\___|| ||    | || || \\\\ \\\\___/   \\\\/   \n' +
          ' \n' +
          '  ************************************************************************************ \n' +
          ' \n' +
          '  Stupid isn\'t it :D:D:D \n' +
          ' \n' +
          '  ************************************************************************************/ \n',
        report : 'min'
      },
      dist: {
        files : {
          '<%= yeoman.dist %>/styles/core.css' : [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin : {
      dist : {
        options : {
          /*removeCommentsFromCDATA: true,
           // https://github.com/yeoman/grunt-usemin/issues/44
           //collapseWhitespace: true,
           collapseBooleanAttributes: true,
           removeAttributeQuotes: true,
           removeRedundantAttributes: true,
           useShortDoctype: true,
           removeEmptyAttributes: true,
           removeOptionalTags: true*/
        },
        files : [
          {
            expand : true,
            cwd : '<%= yeoman.app %>',
            src : ['*.html', 'views/*.html'],
            dest : '<%= yeoman.dist %>'
          }
        ]
      }
    },
    // Put files not handled in other tasks here
    copy : {
      dist : {
        files : [
          {
            expand : true,
            dot : true,
            cwd : '<%= yeoman.app %>',
            dest : '<%= yeoman.dist %>',
            src : [
              '*.{ico,png,txt}',
              'sitemap.xml',
              '.htaccess',
              'images/{,*/}*.{gif,webp}',
              'fonts/*',
              'data/{,*/}*'
            ]
          },
          {
            expand : true,
            cwd : '.tmp/images',
            dest : '<%= yeoman.dist %>/images',
            src : [
              'generated/*'
            ]
          }
        ]
      },
      styles : {
        expand : true,
        cwd : '<%= yeoman.app %>/styles',
        dest : '.tmp/styles/',
        src : '{,*/}*.css'
      }
    },
    concurrent : {
      server : [
        'less',
        'copy:styles'
      ],
      dist : [
        'less',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    cdnify : {
      dist : {
        html : ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin : {
      dist : {
        files : [
          {
            expand : true,
            cwd : '<%= yeoman.dist %>/scripts',
            src : '*.js',
            dest : '<%= yeoman.dist %>/scripts'
          }
        ]
      }
    },
    uglify : {
      dist : {
        files : {
          '<%= yeoman.dist %>/scripts/scripts.js' : [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    }

  });


  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
