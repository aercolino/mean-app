// bears.js

(function() {
    'use strict';

    MyProject.codeSetup({
        type: 'controller',
        name: 'bearsController',
        dependencies: ['$scope'],
        services: ['/bearsService', 'flashService'],
        code: main
    });

    function main(my) {
        
        my.bearsService.List(function (response) {
            if (response.error) {
                return my.flashService.error(response.error);
            }
            my.$scope.bears = response.payload;
        });

    }

})();
