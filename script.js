// *** QUERYSELECTORALL - WONT WORK IN IE8 ***

// cross-browser compatability evt listener fn (<IE8)
function addEventHandler(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener(eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent('on'+eventType,handler); 
}
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

// Model
var Model = function() {
	
	var _model 	= {},
		counter = 0;

	function _resetModel() {
		counter = 0;
		for (var member in _model) {
			_removeTask(member);
		}
	}

	function _addTask(obj) {
		counter += 1;
		_model[counter] = obj;
	}

	function _removeTask(task_num) {
		delete _model[task_num]; 
	}

	function _checkTask(task_num) {
		_model[task_num].status = 'completed';
	}

	function _inProgressTask(task_num) {
		_model[task_num].status = 'in progress';
	}

	function _uncheckTask(task_num) {
		_model[task_num].status = 'incomplete';
	}

	function _alphabetize() {
		keys = Object.keys(model);
		keys.sort();
	}

	function _writeCSV() {
		var csvArray = [],
			csvContent;

		for (var key in _model) {
			if(_model.hasOwnProperty(key)) {
				var obj = _model[key]['name'] + ',' + _model[key]['status'];
				csvArray.push(obj);
			}
		}
		csvContent = csvArray.join("\n");
		return csvContent;
	}

	function _getTaskCnt() {
		console.log(_model);
	}

	// public
	return {
		addTask: _addTask,
		removeTask: _removeTask,
		checkTask: _checkTask,
		inProgressTask: _inProgressTask,
		uncheckTask: _uncheckTask,
		getTaskCnt: _getTaskCnt,
		resetModel: _resetModel,
		writeCSV: _writeCSV,
		model: _model
	}
}();

function Task(name, status) { // Task constructor
	return {
		'name': name,
		'status': (status) ? status : 'incomplete'
	};
}

// Controller
var Controller = {
	counter: 0,
	watch: function(form, removeTask, removeBtn, alphabetize, csv) {
	   
		// add task
		addEventHandler(form, 'submit', function(evt) {
			evt.preventDefault(); // prevent the form from being submitted
      		this.counter += 1;
      		this.add(form.add_task_field.value, this.counter); // add to Model and View
      		form.add_task_field.value = "";
      		form.add_task_field.focus();
		}.bind(this), false);

		// remove last task
		addEventHandler(removeTask, 'click', function(evt) {
			evt.preventDefault();
			this.remove();			
		}.bind(this), false);

		// remove completed tasks
		addEventHandler(removeBtn, 'click', function(evt) {
			evt.preventDefault();
			this.removeCompleted();			
		}.bind(this), false);

		// alphabetize
		addEventHandler(alphabetize, 'click', function(evt) {
			evt.preventDefault();
			this.alphabetize();
		}.bind(this), false);

		// write
		addEventHandler(csv, 'click', function(evt) {
			evt.preventDefault();
			this.writeCSV();
		}.bind(this), false);
	},

	add: function(name, num) {
		var taskName 	= (Array.isArray(name)) ? name[0] : name,
			taskStatus 	= (Array.isArray(name) && name[1] !== 'null') ? name[1] : false,
			taskObj 	= new Task(taskName, taskStatus);

		Model.addTask(taskObj);
		View.renderAddition(name, num);
	},
	remove: function() {
		var taskDIV = document.getElementById('list').lastElementChild;

		Model.removeTask(taskDIV.firstElementChild.getAttribute('data-count'));
		View.removeTask(taskDIV);
	},
	removeCompleted: function() {
		// for each key in model, if has checked value true, delete from object
		var checkedB = document.querySelectorAll('#list [type=checkbox]');
		for (var i = 0, ii = checkedB.length; i < ii; i++) {
			if (checkedB[i].checked) {
				Model.removeTask(checkedB[i].getAttribute('data-count')); // Model

				var taskDIV = checkedB[i].parentNode; // View
				View.removeTask(taskDIV); 
			}
		}			
	},
	toggleChecked: function(evt) {
		var chbxClicked = evt.target.tagName === "INPUT";

		if (chbxClicked) {
			var taskObj = evt.target.getAttribute('data-count'),
			    checked = evt.target.checked,
			    chbx  	= evt.target;
		}
		else if (evt.target.tagName === "DIV") {
			var taskObj 	= evt.target.firstElementChild.getAttribute('data-count'),
			    checked 	= evt.target.firstElementChild.checked,
			    chbx  		= evt.target.firstElementChild,
			    inProgress 	= (evt.target.getAttribute("class") === 'in-progress') ? true : false;
		}
		else if (evt.target.tagName === "LABEL") {
			var taskObj 	= evt.target.previousElementSibling.getAttribute('data-count'),
			    checked 	= evt.target.previousElementSibling.checked,
			    chbx  		= evt.target.previousElementSibling,
			    inProgress 	= (evt.target.parentElement.getAttribute("class") === 'in-progress') ? true : false;
		}

		// uncheck chbx || click div when chbx was checked   
		if ( (!checked && chbxClicked) || (checked && !chbxClicked) ) {
			Model.uncheckTask(taskObj);
			View.incompleted(chbx);
		}
		else if (!chbxClicked && !checked && !inProgress) {
			Model.inProgressTask(taskObj);
			View.inprogress(chbx);
		}
		else {
			Model.checkTask(taskObj);
			View.completed(chbx);
		}	
	},
	alphabetize: function() {
		// remove from Model
		Model.resetModel();
		
		var list 	= document.getElementById("list");
		// get all input.names in #list
		    tasks   = document.querySelectorAll('#list [type=checkbox]');
		    if (tasks) {
		    	var nameArray = [];
		    	
		    	for (i =0, ii =tasks.length; i < ii; i++) {

		    		nameArray.push([tasks[i].name, tasks[i].parentElement.getAttribute('class')]);

		    	}
		    	nameArray.sort(function (a, b) {
				    return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
				});
		    }

		//  remove unalphabetized list from View
		while (list.firstChild) {
		   list.removeChild(list.firstChild);
		}
		// add alphabetized list to view
		for (i=0, ii =nameArray.length; i < ii; i++) {
			this.add(nameArray[i], i+1);
		}
	},
	writeCSV: function() {
		View.writeCSV(Model.writeCSV());
	}
};

// View
var View = {
	renderAddition: function(name, num) {
	    var list 				= document.getElementById("list"),
	    	dv   				= document.createElement("div"),
	    	chbx  				= document.createElement('input'),
			label 				= document.createElement('label');
	
			chbx.type 			= "checkbox";
			chbx.name 			= (Array.isArray(name)) ? name[0] : name;
			chbx.setAttribute('data-count', num);
			label.textContent 	= chbx.name;
			dv.appendChild(chbx);
			dv.appendChild(label);
			if (Array.isArray(name) && name[1] !== null) dv.setAttribute('class', name[1]);
	    	if (name[1] === 'completed') chbx.checked = true;

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
	removeTask: function(taskDIV) {
		var parent = taskDIV;

		while (parent.firstChild) {
		    parent.removeChild(parent.firstChild);
		}
		parent.remove();
	},
	completed: function(chbx) {
		chbx.checked = true;
		chbx.parentElement.removeAttribute("class");
		chbx.parentElement.setAttribute("class", "completed");
	},
	inprogress: function(chbx) {
		chbx.checked = false;
		chbx.parentElement.removeAttribute("class");
		chbx.parentElement.setAttribute("class", "in-progress");
	},
	incompleted: function(chbx) {
		chbx.checked = false;
		chbx.parentElement.removeAttribute("class");
	},
	writeCSV: function(csvString) {

		var form 		= document.getElementById('input'),
			textarea 	= document.createElement("textarea"),
			oldField    = document.getElementsByClassName('csvTextarea'),
			isOld       = (oldField.length > 0 ) ? true : false;

			if (isOld) oldField[0].remove(); // remove current textarea
			textarea.textContent = csvString;
			textarea.setAttribute('class', 'csvTextarea');
		form.appendChild(textarea);
	}
}

Controller.watch(document.getElementById('input'), document.getElementById('removeTask'), document.getElementById('removeBtn'), document.getElementById('alphabetize'), document.getElementById('csv'));