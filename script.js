// *** QUERYSELECTORALL - WONT WORK IN IE8 ***

// cross-browser compatability evt listener fn (<IE8)
function addEventHandler(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener(eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent('on'+eventType,handler); 
}


/* 
  Model ========================
		- Add task
		- Remove task
		- (one object)
		- Add checked flag
		- Uncheck flag 
		- write to */
var Model = function() {
	
	// collection of task objects 
	// name = {
	// 		checked: boolean
	// }
	var _model = {};

	function _addTask(obj) {
		_model[obj['name']] = obj;
	}

	function _removeTask(task_name) {
		delete _model[task_name]; 
	}

	function _checkTask(task_name) {
		_model[task_name].checked = true;
	}

	function _uncheckTask(task_name) {
		_model[task_name].checked = false;
	}

	function _alphabetize() {
		keys = Object.keys(model);
		keys.sort();
	}

	function write() {

	}

	function _getTaskCnt() {
		console.log(_model);
	}

	// public
	return {
		addTask: _addTask,
		removeTask: _removeTask,
		checkTask: _checkTask,
		uncheckTask: _uncheckTask,
		getTaskCnt: _getTaskCnt,
		model: _model
	}
}();

function Task(name) { // Task constructor
	return {
		'name': name,
		'checked': false
	};
}

// Controller
var Controller = {
	watch: function(form, removeBtn, alphabetize) {
	   
		// add task
		addEventHandler(form, 'submit', function(evt) {
			evt.preventDefault(); // prevent the form from being submitted
      		this.add(form.add_task_field.value); // add to Model and View
		}.bind(this), false);

		// remove task
		addEventHandler(removeBtn, 'click', function(evt) {
			evt.preventDefault();
			this.remove();			
		}.bind(this), false);

		// alphabetize
		addEventHandler(alphabetize, 'click', function() {
			this.alphabetize();
		});

		// write
		addEventHandler(form, 'submit', function() {

		});
	},

	add: function(name) {
		var taskObj = new Task(name);

		if (Model.model.hasOwnProperty(taskObj[name])) {
			alert('duplicate');
			taskObj[name] += $;
		}
		Model.addTask(taskObj);
		View.renderAddition(name);
	},
	remove: function() {
		// for each key in model, if has checked value true, delete from object
		var checkedB = document.querySelectorAll('[type=checkbox]');
		for (var i = 0, ii = checkedB.length; i < ii; i++) {
			if (checkedB[i].checked) {
				Model.removeTask(checkedB[i].name); // Model

				var parent = checkedB[i].parentNode; // View
				while (parent.firstChild) {
				    parent.removeChild(parent.firstChild);
				}

			}
		}			
	},
	toggleChecked: function(evt) {
		var chbxClicked = evt.target.tagName === "INPUT";

		if (chbxClicked) {
			var taskObj = evt.target.name,
			    checked = evt.target.checked,
			    chbx  	= evt.target;
		}
		else if (evt.target.tagName === "DIV") {
			var taskObj = evt.target.firstElementChild.name,
			    checked = evt.target.firstElementChild.checked,
			    chbx  	= evt.target.firstElementChild;
		}

		   
		if ( (!checked && chbxClicked) || (checked && !chbxClicked) ) {
			Model.uncheckTask(taskObj);
			View.unLineThrough(chbx);
		}
		else {
			Model.checkTask(taskObj);
			View.lineThrough(chbx);
		}	
	},
	alphabetize: function() {
		keys = Module.keys(myObj)
	},
	write: function() {

	}
};

// View
var View = {
	renderAddition: function(name) {
		console.log('render');
	    var list 				= document.getElementById("list"),
	    	dv   				= document.createElement("div"),
	    	chbx  				= document.createElement('input'),
			label 				= document.createElement('label');
	
			chbx.type 			= "checkbox";
			chbx.name 			= name;
			label.textContent 	= name;
			dv.appendChild(chbx);
			dv.appendChild(label);
	    
	    list.appendChild(dv);

	    // add event listeners to dynamically-created content
	    addEventHandler(chbx, 'change', function(evt) { // checkbx
	    	evt.stopPropagation();
	    	Controller.toggleChecked(evt);
		});
		 addEventHandler(dv, 'click', function(evt) {   // task div
	    	if (evt.target.tagName !== "INPUT") 
	    		Controller.toggleChecked(evt); 
		});
 	},
	render: function() {

	},
	lineThrough: function(chbx) {
		chbx.checked = true;
		chbx.nextSibling.style.textDecoration = "line-through";
	},
	unLineThrough: function(chbx) {
		chbx.checked = false;
		chbx.nextSibling.style.textDecoration = "none";	
	}
}

Controller.watch(document.getElementById('input'), document.getElementById('removeBtn'), document.getElementById('alphabetize'));