define(function (require) {
    // Load library/vendor modules using
    
    // Load any app-specific modules
    //var addEventHandler = require('./modules/addEventHandler');
    //var Model = require('./modules/model');
    //var View = require('./modules/view');
    var Controller = require('./modules/controller');
        
    // app logic ----------------------------------------->
    Controller.start(); // +
    Controller.watch(
        document.getElementById('input'),
        document.getElementById('removeTask'),
        document.getElementById('removeBtn'),
        document.getElementById('alphabetize'), 
        document.getElementById('csv'), 
        document.getElementById('createList'), 
        document.getElementById('saveList'), 
        document.getElementById('removeList'), 
        document.querySelectorAll('button[data-indent]'),
        document.getElementById('mark-in-progress'),
        document.getElementById('select'),
        document.getElementById('createNewList'),
        document.getElementById('mark-incomplete'),
        document.getElementById('mark-completed'),
        document.getElementsByTagName('body')[0]
    ); // +

    Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");

        // find the y coordinate where dropped
        // find the list item (if there is one) where the y coordinate exists
        // append the drag el next to list item
        
        //The Node.insertBefore() method inserts the specified node before a reference node as a child of the current node.
        //var insertedNode = parentNode.insertBefore(newNode, referenceNode);   
        
        ev.target.appendChild(document.getElementById(data));
    }

    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }
});