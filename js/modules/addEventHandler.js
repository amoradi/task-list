// addEventHandler
define(function() {
	return function(elem,eventType,handler) {
	    if (elem.addEventListener)
	        elem.addEventListener(eventType,handler,false);
	    else if (elem.attachEvent)
	        elem.attachEvent('on'+eventType,handler);
	};
	
});