// Controller module
define(["./model", "./view", "./addEventHandler", "./task"], function(model, view, addEventHandler, Task) {

	return Controller = {
		counter: 0,
		start: function() {
			this.addPlaceHolderDate();
			View.drawSavedLists();
		},
		watch: function(
			addTask,
			removeTask,
			removeBtn,
			alphabetize,
			csv,
			createList,
			saveList,
			deleteList,
			indentBtns,
			markInProgress,
			selectAll,
			createNewList,
			markIncomplete,
			markCompleted,
			clickOff) {
		    
		    // click body (not button, input field)
		    if (clickOff) {
		    	addEventHandler(clickOff, 'click', function(evt) {
		    		console.log('body clicked: '+evt.target.nodeName);
		    		
		    		if (evt.target.nodeName !== 'BUTTON' && evt.target.nodeName !== 'INPUT' && evt.target.nodeName !== 'SPAN' && !evt.target.hasAttribute('draggable')) {
		    			console.log(evt.target.nodeName);
		    			this.toggleSelect(false);
		    		} 
		    	}.bind(this), false);
		    }

		    // click mark completed
		    if (markCompleted) {
		    	addEventHandler(markCompleted, 'click', function(evt) {
					evt.preventDefault();
					this.updateStatus("completed");
				}.bind(this), false);
		    }

		    // click mark incomplete
		    if (markIncomplete) {
		    	addEventHandler(markIncomplete, 'click', function(evt) {
					evt.preventDefault();
					this.updateStatus("incomplete");
				}.bind(this), false);
		    }

		    // click create new list btn
		    if (createNewList) {
		    	addEventHandler(createNewList, 'click', function(evt) {
					evt.preventDefault();
					View.markListasSaved(false);
					View.hideCreateNewList(false);
				}.bind(this), false);
		    }

		    // click select / deselect
			if (selectAll) {
				addEventHandler(selectAll, 'click', function(evt) {
					evt.preventDefault();
					this.toggleSelect();
				}.bind(this), false);
			}

			// set status 'in-progress'
		    if (markInProgress) {
		    	addEventHandler(markInProgress, 'click', function(evt) {
					evt.preventDefault();
					this.updateStatus("in progress");
				}.bind(this), false);
			}

		    // indent - unindent
		    if (indentBtns) {
		    	for (var i=0, ii = indentBtns.length; i < ii; i++) {
		    		addEventHandler(indentBtns[i], 'click', function(evt) {
						evt.preventDefault();
						this.indentTask(evt);
					}.bind(this), false);
		    	}
			}

			// save list to local storage
			if (saveList) {
				addEventHandler(saveList, 'click', function(evt) {
					evt.preventDefault();
					this.saveList();
				}.bind(this), false);
			}

			// delete list to local storage
			if (deleteList) {
				addEventHandler(deleteList, 'click', function(evt) {
					evt.preventDefault();
					this.deleteList();
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
			if (addTask) {
				addEventHandler(addTask, 'submit', function(evt) {
					evt.preventDefault(); // prevent the form from being submitted
					this.counter += 1;
		      		this.addTask(addTask.add_task_field.value, this.counter); // add to Model and View
		      		addTask.add_task_field.value = "";
		      		addTask.add_task_field.focus();
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
		toggleSelect: function(select) {
			var select = (typeof select !== 'undefined') ? select : (document.querySelectorAll('#meta span + span')[0].getAttribute('class') === "orange") ? false : true;
			View.toggleSelect(select);
			console.log(select);
		},
		updateStatus: function(status) {
			var selected = document.querySelectorAll('#list [data-selected]');

			for (var i=0, ii = selected.length; i < ii; i++) {
				var chbx 	= selected[i].firstElementChild,
					taskObj = chbx.getAttribute('data-count');

				Model.updateStatus(taskObj, status);
				View.updateStatus(chbx, status);
			}
		},
		indentTask: function(evt) {
			console.log('%%%%');
			Model.indentTask(evt);
			View.indentTask(evt);
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
			var x = true;
			View.markListasSaved(true);
			View.drawSavedLists(x);
		},
		deleteList: function() {
			View.deleteList();
			View.markListasSaved(false);
		},
		createList: function(listName, dueDate, tasks) {
			// remove from Model
			Model.resetModel();

			var dueDate = dueDate.split('/');
			
			// if date is valid
			if (this.validateDate(dueDate[2], dueDate[0], dueDate[1])) {
				Model.setName(listName);
				Model.setDate(dueDate.join('/'));
				View.addList(listName, dueDate);
	 			
	 			// remove previous list items
	 			for (var i =0, ii = this.counter; i < ii; i++) {
	 				this.remove();
	 			}

	 			this.counter = 0;
				if (tasks && Object.keys(tasks).length > 0) { // if from localStorage
					for (var member in tasks) {
						if (tasks.hasOwnProperty(member)) {
					        Controller.counter = parseInt(member);
					        console.log("member# " + member);				       
					        this.addTask(tasks[member].name, member, tasks[member].status, tasks[member].indentation);
					    }
					}
				}
				else {
					View.hideListMetaControls(true);
				}
			}
			else {
				View.invalidDate();
			}
			View.markListasSaved(false);
			View.checkSelectNumber();
		},
		addTask: function(name, num, status, indentation) {
			var taskName 	= (Array.isArray(name)) ? name[0] : name,
				taskStatus 	= (Array.isArray(name) && name[1] !== 'null') ? name[1] : false,
				taskStatus  = taskStatus || status,
				taskStatus  = (taskStatus === 'in-progress') ? 'in progress' : taskStatus,
				indentation = (typeof indentation === 'undefined') ? ((Array.isArray(name) && name[2] !== 'null') ? name[2] : false) : indentation, 
				taskObj 	= new Task(taskName, taskStatus, indentation);

			Model.addTask(taskObj);
			View.renderAddition(name, num, status, indentation);
		},
		updateTask: function(count, taskName) {
			Model.updateTask(count, taskName);
			View.updateTask(count, taskName);
		},
		remove: function(evt) {
			var	selectedCollection	= document.querySelectorAll('#list [data-selected]'),
				taskDIVisCollection = (selectedCollection.length > 0) ? true : false, 
				taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;
			
				// remove selected tasks
				if (taskDIVisCollection) { 
					for (var i =0, ii = taskDIV.length; i < ii; i++) {
						this.counter -= 1;

						//Model.removeTask(taskDIV[i].firstElementChild.getAttribute('data-count'));
						//Model.updateCounts();

						View.removeTask(taskDIV[i]);
						//View.updateCounts();
					}
				}
				// remove last task
				else { 
					this.counter -= 1;

					//Model.removeTask(taskDIV.firstElementChild.getAttribute('data-count'));
					View.removeTask(taskDIV);
					//View.updateCounts();
				}

				this.redraw(false);
		},
		removeCompleted: function() {
			// for each key in model, if has checked value true, delete from object
			var checkedB = document.querySelectorAll('#list [type=checkbox]');
			for (var i = 0, ii = checkedB.length; i < ii; i++) {
				if (checkedB[i].checked) {
					//Model.removeTask(checkedB[i].getAttribute('data-count')); // Model

					var taskDIV = checkedB[i].parentNode; // View
					View.removeTask(taskDIV); 
				}
			}

			this.redraw(false);			
		},
		toggleChecked: function(evt) {
			var chbxClicked = evt.target.tagName === "INPUT";

			if (chbxClicked) {
				var taskObj = evt.target.getAttribute('data-count'),
				    checked = evt.target.checked,
				    chbx  	= evt.target;
			}
			// else if (evt.target.tagName === "DIV") {
			// 	var taskObj 	= evt.target.firstElementChild.getAttribute('data-count'),
			// 	    checked 	= evt.target.firstElementChild.checked,
			// 	    chbx  		= evt.target.firstElementChild,
			// 	    inProgress 	= (evt.target.getAttribute("class") === 'in-progress') ? true : false;
			// }
			// else if (evt.target.tagName === "LABEL") {
			// 	var taskObj 	= evt.target.previousElementSibling.getAttribute('data-count'),
			// 	    checked 	= evt.target.previousElementSibling.checked,
			// 	    chbx  		= evt.target.previousElementSibling,
			// 	    inProgress 	= (evt.target.parentElement.getAttribute("class") === 'in-progress') ? true : false;
			// }
			// else if (evt.target.tagName === "span") {
			// 	View.selectedTask(evt);
			// }

			// uncheck chbx || click div when chbx was checked   
			if ( (!checked && chbxClicked) /*|| (checked && !chbxClicked)*/ ) {
				Model.uncheckTask(taskObj);
				View.incompleted(chbx);
			}
			// else if (!chbxClicked && !checked && !inProgress) {
			// 	Model.inProgressTask(taskObj);
			// 	View.inprogress(chbx);
			// }
			else {
				Model.checkTask(taskObj);
				View.completed(chbx);
			}	
		},
		toggleSelected: function(evt) {
			var taskDIV = evt.currentTarget.parentElement,
				taskObj = taskDIV.getAttribute('data-count');

			if (taskDIV.getAttribute('data-selected') === "true") {
				//Model.inProgressTask(taskObj);
				View.unselectTask(taskDIV);
			}
			else {
				//Model.inProgressTask();
				View.selectTask(taskDIV);
			}
		},
		alphabetize: function() {
			this.redraw(true);
		},
		redraw: function(alphabetize) {
			// remove from Model
			Model.resetModel();
			
			var list 	= document.getElementById("list");
			// get all input.names in #list
			    tasks   = document.querySelectorAll('#list [type=checkbox]');
			    if (tasks) {
			    	var nameArray = [];
			    	
			    	for (i =0, ii =tasks.length; i < ii; i++) {
			    		nameArray.push([tasks[i].name, tasks[i].parentElement.getAttribute('class'), tasks[i].parentElement.getAttribute('data-indent')]);
			    	}

			    	if (alphabetize) {
				    	nameArray.sort(function (a, b) {
						    return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
						});
				    }
			    }

			// remove list from View
			while (list.firstChild) {
			   list.removeChild(list.firstChild);
			}
			// add list to view
			for (i = 0, ii = nameArray.length; i < ii; i++) {
				this.addTask(nameArray[i], i+1);
			}

			if (nameArray.length === 0) View.hideListMetaControls(true);
			View.checkSelectNumber();
		},
		writeCSV: function() {
			View.writeCSV(Model.writeCSV());
		}
	};
});
