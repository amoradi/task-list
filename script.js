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
		name,
		dueDate,
		counter = 0;

	function _resetModel() {
		counter = 0;
		for (var member in _model) {
			_removeTask(member);
		}
	}

	function _saveToLocalStorage() {
		if(typeof(Storage) !== "undefined") {
			var listName = _getName(),
				listDate = _getDate();

		    localStorage.setItem('taskMaster.'+listName, '[{"dueDate":"'+listDate+'"},' + JSON.stringify(_model) + ']' ); // store

		} else {
		    alert('Sorry, unable to save. No Web Storage support.');
		}
	}

	function _setName(listName) {
		name = listName;
	}

	function _getName() {
		return name;
	}

	function _setDate(dueDate) {
		date = dueDate.toString();
	}

	function _getDate() {
		return date;
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
		setName: _setName,
		getName: _getName,
		setDate: _setDate,
		getDate: _getDate,
		saveToLocalStorage: _saveToLocalStorage,
		model: _model
	};
}();

function Task(name, status) { // Task constructor
	return {
		name: name,
		status: (status) ? status : 'incomplete'
	};
}

// Controller
var Controller = {
	counter: 0,
	watch: function(form, removeTask, removeBtn, alphabetize, csv, createList, saveList, deleteList) {
	   
		// save list to local storage
		if (saveList) {
			addEventHandler(saveList, 'click', function(evt) {
				evt.preventDefault();
				this.saveList();
			}.bind(this), false);
		}

		// create List
		if (createList) {
			addEventHandler(createList, 'submit', function(evt) {
				evt.preventDefault();
				this.createList(createList.listName.value, createList.dueDate.value || createList.dueDate.placeholder);
			}.bind(this), false);
		}

		// add task
		if (form) {
			addEventHandler(form, 'submit', function(evt) {
				evt.preventDefault(); // prevent the form from being submitted
	      		this.counter += 1;
	      		this.addTask(form.add_task_field.value, this.counter); // add to Model and View
	      		form.add_task_field.value = "";
	      		form.add_task_field.focus();
			}.bind(this), false);
		}

		// remove last task
		if (removeTask) {
			addEventHandler(removeTask, 'click', function(evt) {
				evt.preventDefault();
				this.remove();			
			}.bind(this), false);
		}

		// remove completed tasks
		if (removeBtn) {
			addEventHandler(removeBtn, 'click', function(evt) {
				evt.preventDefault();
				this.removeCompleted();			
			}.bind(this), false);
		}

		// alphabetize
		if (alphabetize) {
			addEventHandler(alphabetize, 'click', function(evt) {
				evt.preventDefault();
				this.alphabetize();
			}.bind(this), false);
		}
		// write
		if (csv) {
			addEventHandler(csv, 'click', function(evt) {
				evt.preventDefault();
				this.writeCSV();
			}.bind(this), false);
		}
	},
	addPlaceHolderDate: function() { 
		var d 			= new Date(),
		    m 			= d.getMonth() + 1,
		    day 		= d.getDate(),
		    year 		= d.getFullYear(),
			dateString 	= m + "/" + day + "/" + year;

			document.getElementsByName("dueDate")[0].placeholder = dateString;
	},
	validateDate: function(year, month, day) {
	    var d = new Date(year, month, day);
	    if (d.getFullYear() == year && d.getMonth() == month && d.getDate() == day) {
	        return true;
	    }
	    return false;
	},
	saveList: function() {
		Model.saveToLocalStorage();
		View.saveList();
	},
	createList: function(listName, dueDate, tasks) {
		var dueDate = dueDate.split('/');
		
		if (this.validateDate(dueDate[2], dueDate[0], dueDate[1])) {
			Model.setName(listName);
			Model.setDate(dueDate.join('/'));
			View.addList(listName, dueDate);

			// if (tasks) {
			// 	for each task
			// this.counter = tasks[i].num; 
			// 	this.addTask(tasks[i].name, tasks[i].num, tasks[i].status);
			// }
		}
		else {
			View.invalidDate();
		}
	},
	addTask: function(name, num, status) {
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
			this.addTask(nameArray[i], i+1);
		}
	},
	writeCSV: function() {
		View.writeCSV(Model.writeCSV());
	}
};

// View
var View = {
	saveList: function() {
		var sidebar = document.getElementsByClassName('sidebar')[0];

		for (var i =0, ii = localStorage.length; i < ii; i++) {
			if (/^taskMaster/.test(localStorage.key(i))) {
				var list = JSON.parse(localStorage.getItem(localStorage.key(i)));
				console.log(list);
				sidebar.innerHTML += '<span data-list='+localStorage.key(i) + ' class="myLists"><span>' + localStorage.key(i).slice(11) + '</span><span class="savedListDates">' + list[0].dueDate + '</span></span>';

			}
		}
		// Object.keys(localStorage)
	 //      .forEach(function(key){
	 //           if (/^taskMaster/.test(key)) {
	 //               localStorage.removeItem(key);
	 //           }
  //      });
	},
	addList: function(listName, dueDate) {
		 var h1	= document.getElementById("listName"),
			 dueDate = new Date(dueDate.join('/'));
		 
		 h1.innerHTML = listName + "<span>Due on <strong>" + dueDate.toDateString() + "</strong></span>";
		 document.getElementById("createList").setAttribute("class", "hide");
		 document.getElementById("input").removeAttribute("class", "");
	},
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

Controller.addPlaceHolderDate();
Controller.watch(document.getElementById('input'), document.getElementById('removeTask'), document.getElementById('removeBtn'), document.getElementById('alphabetize'), document.getElementById('csv'), document.getElementById('createList'), document.getElementById('saveList'));