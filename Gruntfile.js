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
    dist : 'dist',
    tplsFile: 'generatedTemplates.js'
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
      templates: {
        files: ['<%= yeoman.app %>/*/{,**/}*.html'],
        tasks: ['ngtemplates']
      },
      livereload : {
        options : {
          livereload : LIVERELOAD_PORT
        },
        files : [
          '<%= yeoman.app %>/*.html',
          '<%= yeoman.app %>/less/{,*/}*.less',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoprefixer : {
      options : ['last 10 version', 'ie 8'],
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

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,**/}*.js',
          '<%= yeoman.dist %>/styles/{,**/}*.css',
          '<%= yeoman.dist %>/images/{,**/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/fonts/*'
        ]
      }
    },

    useminPrepare : {
      html : '<%= yeoman.app %>/index.html',
      options : {
        dest : '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              css: ['concat']
            },
            post: {}
          }
        }
      }
    },

    usemin : {
      html : ['<%= yeoman.dist %>/{,*/}*.html'],
      css : ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/scripts/*.js'],
      options : {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/images',
          '<%= yeoman.dist %>/styles'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          // collapseWhitespace: true,
          // conservativeCollapse: true,
          // collapseBooleanAttributes: true,
          // removeCommentsFromCDATA: true,
          // removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // angular templates
    // extract all templates and create
    // separate module for injection
    ///////////////////////////////////////
    ngtemplates : {
      'app.html-templates' : {
        cwd     : '<%= yeoman.app %>',
        src     : 'views/{,**/}*.html',
        dest    : '<%= yeoman.app %>/scripts/<%= yeoman.tplsFile %>',
        options : {
          standalone : true
        }
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
              'CNAME',
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

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: ['{,*/}*.js'],
          dest: '<%= yeoman.dist %>/scripts'
        }]
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


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'ngtemplates',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',     // clean temp and dist directories
    'concurrent:dist',// compile less, move images to dist
    'autoprefixer',   // prefix styles in tmp and app
    'ngtemplates',    // generate angular templates file in app
    'useminPrepare',  // read html build blocks and prepare to concatenate and move css,js to dist
    'concat',
    'cssmin',
    'ngAnnotate',
    'copy:dist',
    'uglify',
    'filerev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
