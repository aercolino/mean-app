(function() {
    'use strict';

    MyProject.CodeSetup({
        type: 'controller',
        name: 'myEmptyController',
        dependencies: [],
        services: [],
        code: main
    });

    function main(my) {
        var self = {};
        return self;
    }

})();
