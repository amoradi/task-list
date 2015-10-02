define(function() {
    return function(name, status, indentation) { // Task constructor
        return {
            name: name,
            status: (status) ? status : 'incomplete',
            indentation: (indentation) ? indentation : 'none'
        };
    }
});