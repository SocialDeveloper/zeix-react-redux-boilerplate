module.exports = function (plop) {
  'use strict';

  // Component and Container Generator
  plop.setGenerator('Add React Component', {
    description: 'Create a React Component',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'name of the new component:'
    }, {
      // Type of the component (Component or Container)
      type: 'list',
      name: 'type',
      message: 'what type should it be:',
      choices: [
          "component",
          "container"
      ]
    }, {
      // Check if redux files have to be added
      type: 'confirm',
      name: 'hasRedux',
      message: 'Do you need Redux for that component'
    }],

    // Actions done by plop
    actions: ( data ) =>  {
      let actions = [];

      // Adding necessary react files
      actions.push({
        type: 'add',
        path: 'app/{{type}}s/{{properCase name}}/{{properCase name}}.js',
        templateFile: 'internals/templates/Component.js'
      });

      // Change the name in the file
      actions.push({
        type: 'modify',
        path: 'app/{{type}}s/{{properCase name}}/{{properCase name}}.js',
        pattern: /(.NAME.)/g,
        template: '{{properCase name}}'
      });

      // If it has redux do so much more
      if (data.hasRedux) {
        actions.push( {
          // Adding the empty actions file
          type: 'add',
          path: 'app/{{type}}s/{{properCase name}}/actions.js',
          templateFile: 'internals/templates/Action.js'
        }, {
          // Adding the reducers file
          type: 'add',
          path: 'app/{{type}}s/{{properCase name}}/reducers.js',
          templateFile: 'internals/templates/Reducer.js'
        }, {
          // Change the reducer name
          type: 'modify',
          path: 'app/{{type}}s/{{properCase name}}/reducers.js',
          pattern: /(.NAME.)/g,
          template: '{{camelCase name}}Reducer'
        }, {
          // Add import to global reducer file
          type: 'modify',
          path: 'app/reducers.js',
          pattern: /(\/\/ IMPORT HERE \/\/)/g,
          template: 'import {{camelCase name}}Reducer from "./{{type}}s/{{properCase name}}/reducers.js"\n// IMPORT HERE //'
        }, {
          // Add Reducer to combine reducer function
          type: 'modify',
          path: 'app/reducers.js',
          pattern: /(\/\/ ADD REDUCER HERE \/\/)/g,
          template: '{{camelCase name}}Reducer,\n// ADD REDUCER HERE //'
        }, {
          // Add actions to App/App.js where they are going to be connected
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: /(\/\/ IMPORT ACTIONS HERE \/\/)/g,
          template: 'import * as {{camelCase name}}Actions from "../../{{type}}s/{{properCase name}}/actions.js"\n// IMPORT ACTIONS HERE //'
        }, {
          // Add the actions to the bindActionCreators
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: /(\/\/ ADD ACTIONS HERE \/\/)/g,
          template: '{{camelCase name}}Actions,\n// ADD ACTIONS HERE //'
        },
        {
          // Return the state to the props of the reducers
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: /(\/\/ ADD STATE RETURN \/\/)/g,
          template: '{{camelCase name}}Data: state.{{camelCase name}}Reducer,\n// ADD STATE RETURN //'
        } );
      }

      return actions;
    }
  });

  // Remove a Component or a container
  plop.setGenerator('Remove React Component', {
    description: 'Remove a React Component and all autogenerated dependencies',
    prompts: [
      {
        type: 'list',
        name: 'type',
        message: 'What is the type of the component:',
        choices: [
            'component',
            'container'
        ]
      },
      {
        type: 'list',
        name: 'componentFolderName',
        message: 'Which one to remove?',
        choices: function (response) {
          return getDirectories(response);
        }
      }
    ],
    actions: ( data ) =>  {
      let actions = [];

      actions.push(
        function (data) {
          const fs = require('fs');
          const path = `./app/${data.type}s/${data.componentFolderName}/`;
          const msg = 'We deleted the {{componentFolderName}}!!!!';

          if (fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file, index) {
              var currPath = path + '/' + file;

              fs.unlinkSync(currPath);
            });

            fs.rmdirSync(path);
          }

          return plop.renderString(msg, data);
        }, {
          type: 'modify',
          path: 'app/reducers.js',
          pattern: new RegExp('import ' + camelize(data.componentFolderName) + 'Reducer.*\n', 'g'),
          template: ''
        }, {
          type: 'modify',
          path: 'app/reducers.js',
          pattern: new RegExp(camelize(data.componentFolderName) + 'Reducer,\n', 'g'),
          template: ''
        }, {
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: new RegExp(`import . as ${camelize(data.componentFolderName)}Actions.*\n`, 'g'),
          template: ''
        }, {
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: new RegExp(camelize(data.componentFolderName) + 'Data.*\n', 'g'),
          template: ''
        },
        {
          type: 'modify',
          path: 'app/containers/App/App.js',
          pattern: new RegExp(camelize(data.componentFolderName) + 'Actions,\n', 'g'),
          template: ''
        }
      );


      return actions;
    }
  })

  plop.setGenerator('Rename React Component', {
    description: 'Rename a React Component',
    prompts: [
      {
        type: 'list',
        name: 'type',
        message: 'What is the type of the component:',
        choices: [
          'component',
          'container'
        ]
      },
      {
        type: 'list',
        name: 'componentFolderName',
        message: 'Which one to rename?',
        choices: function (response) {
          return getDirectories(response);
        }
      },
      {
        type: 'input',
        name: 'newName',
        message: 'What should it be called from now on?'
      }
    ],
    actions: (data) => {
      let actions = [];

      actions.push({
        type: 'modify',
        path: 'app/{{type}}s/{{properCase componentFolderName}}/{{properCase componentFolderName}}.js',
        pattern: new RegExp(titelize(data.componentFolderName), 'g'),
        template: '{{properCase newName}}'
      }, {
        type: 'modify',
        path: 'app/{{type}}s/{{properCase componentFolderName}}/reducers.js',
        pattern: new RegExp(camelize(data.componentFolderName) + 'Reducer', 'g'),
        template: '{{camelCase newName}}Reducer'
      }, {
        type: 'modify',
        path: 'app/reducers.js',
        pattern: new RegExp(camelize(data.componentFolderName) + 'Reducer', 'g'),
        template: '{{camelCase newName}}Reducer'
      }, {
        type: 'modify',
        path: 'app/reducers.js',
        pattern: new RegExp(`./${data.type}s/${titelize(data.componentFolderName)}/`, 'g'),
        template: './{{type}}s/{{properCase newName}}/'
      }, {
        type: 'modify',
        path: 'app/containers/App/App.js',
        pattern: new RegExp(`../../${data.type}s/${titelize(data.componentFolderName)}/`, 'g'),
        template: '../../{{type}}s/{{properCase newName}}/'
      }, {
        type: 'modify',
        path: 'app/containers/App/App.js',
        pattern: new RegExp(`${camelize(data.componentFolderName)}Actions`, 'g'),
        template: '{{camelCase newName}}Actions'
      }, {
        type: 'modify',
        path: 'app/containers/App/App.js',
        pattern: new RegExp(`${camelize(data.componentFolderName)}Data: state.${camelize(data.componentFolderName)}Reducer`),
        template: '{{camelCase newName}}Data: state.{{camelCase newName}}Reducer'
      }, function (data) {
        const fs = require('fs'),
            filePath = `./app/${data.type}s/${titelize(data.componentFolderName)}/`,
            oldFileName = `${titelize(data.componentFolderName)}.js`,
            newFileName = `${titelize(data.newName)}.js`;


        fs.rename(filePath + oldFileName, filePath + newFileName, function(err) {
          if (err) console.log('ERROR: ' + err);
        });

        return plop.renderString('Renamed the main file {{properCase newName}}.js');
      }, function (data) {
        const fs = require('fs'),
            filePath = `./app/${data.type}s/`,
            oldDirName = `${titelize(data.componentFolderName)}`,
            newDirName = `${titelize(data.newName)}`;

        fs.rename(filePath + oldDirName, filePath + newDirName, function (err) {
          if (err) console.log('ERROR: ' + err);
        });

        return plop.renderString('Renamed the directory {{properCase newName}}');
      });

      return actions;
    }
  });

  plop.setGenerator('Add Saga', {
    prompts: [
      {
        type: 'input',
        name: 'sagaName',
        message: 'What is the name of the new saga'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'app/sagas/watchers/watch{{properCase sagaName}}.js',
        templateFile: 'internals/templates/sagaWatcher.js'
      },
      {
        type: 'add',
        path: 'app/sagas/workers/work{{properCase sagaName}}.js',
        templateFile: 'internals/templates/sagaWorker.js'
      },
      {
        type: 'modify',
        path: 'app/sagas/root.js',
        pattern: new RegExp('\/\/ IMPORT NEW WATCHER \/\/', 'g'),
        template: 'import watch{{properCase sagaName}} from "./watchers/watch{{properCase sagaName}}"\n// IMPORT NEW WATCHER //'
      },
      {
        type: 'modify',
        path: 'app/sagas/root.js',
        pattern: new RegExp('\/\/ ADD WATCHER HERE \/\/', 'g'),
        template: 'watch{{properCase sagaName}},\n// ADD WATCHER HERE //'
      },
      {
        type: 'modify',
        path: 'app/sagas/watchers/watch{{properCase sagaName}}.js',
        pattern: new RegExp('\.NAME\.', 'g'),
        template: '{{properCase sagaName}}'
      },
      {
        type: 'modify',
        path: 'app/sagas/workers/work{{properCase sagaName}}.js',
        pattern: new RegExp('\.NAME\.', 'g'),
        template: '{{properCase sagaName}}'
      }
    ]
  })
}

function getDirectories(response) {
  const fs = require('fs');
  const path = require('path');
  const srcpath = `./app/${response.type}s/`;

  return fs.readdirSync(srcpath)
      .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function titelize(str) {
  str = camelize(str);

  return str.charAt(0).toUpperCase() + str.slice(1);
}
