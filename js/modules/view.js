// View module
define(["./model", "./controller", "./addEventHandler"], function(model, controller, addEventHandler) {
	return View = {
		invalidDate: function() {
			alert('Enter date - mm/dd/yyyy');
		},
		hideListMetaControls: function(hide) {
			var controls = document.getElementById("btmListControls"),
				meta     = document.getElementById("meta");
			
			if (hide) {
				controls.setAttribute("class", "hide");
				meta.setAttribute("class", "hide");
			}
			else {
				controls.removeAttribute("class");
				meta.removeAttribute("class");
			}
		},
		resetCreateListForm: function() {
			document.getElementById('createList').reset();
		},
		markListasSaved: function(saved) {
			var listName = document.getElementById('listName');

			if (saved) {
				listName.setAttribute('data-saved', 'true');
			}
			else {
				listName.removeAttribute('data-saved');
			}
		},
		drawSavedLists: function(clickedSave) {
			console.log(clickedSave);
			if (typeof clickedSave !== "undefined" && clickedSave) { 
				alert("List saved!");
			}
			var sidebar = document.getElementsByClassName('sidebar')[0];
			sidebar.innerHTML = '';
			for (var i =0, ii = localStorage.length; i < ii; i++) {
				if (/^taskMaster/.test(localStorage.key(i))) {
					var list = JSON.parse(localStorage.getItem(localStorage.key(i)));
					sidebar.innerHTML += '<span class="savedList"><span>' + localStorage.key(i).slice(11) + '</span><span class="savedListDates">' + list[0].dueDate + '</span></span>';
				}
			}
			
			// + add evt listeners to newly created content
			var savedLists = document.getElementsByClassName('savedList');
			for (var i = 0, ii = savedLists.length; i < ii; i++) {
				addEventHandler(savedLists[i], 'click', function(evt) {
					evt.preventDefault();
					
					var titleSpan = evt.currentTarget.firstElementChild,
						listName  = titleSpan.innerHTML,
						dueDate   = titleSpan.nextElementSibling.innerHTML,
						tasks 	  = window.localStorage.getItem("taskMaster." + listName),
						tasks 	  = JSON.parse(tasks),
						tasks     = tasks[1];

					Controller.createList(listName, dueDate, tasks);
					View.markListasSaved(true);
				});
			}
		},
		deleteList: function() {
			if (confirm("Are you sure you want to delete this list?")) {
				var listName 		= document.getElementById('listName'),
					listNameText 	= listName.childNodes[0].nodeValue,
					listIsSaved     = (listName.getAttribute('data-saved') === "true") ? true : false,
					localStorageKey = "taskMaster." + listNameText;
					regExKey 		= new RegExp(localStorageKey, 'g');

				// if list is saved, delete from local storage
				if (listIsSaved) {
					for (var i =0, ii = localStorage.length; i < ii; i++) {
						if (regExKey.test(localStorage.key(i))) {
							console.log("removed " + localStorageKey);
							localStorage.removeItem(localStorageKey);
						}
					}
				}

				// update saved lists column
				this.drawSavedLists();
				// delete from View
				var tasks = document.querySelectorAll('#list > div');
				for (var i =0, ii = tasks.length; i < ii; i++) {
					this.removeTask(tasks[i])
				}
				// delete from Model
				Model.resetModel();
				// go to create new list view
				this.hideCreateNewList(false);
			}
			else {
				return;
			}
		},
		addList: function(listName, dueDate) {
			 var h1	= document.getElementById("listName"),
				 dueDate = new Date(dueDate.join('/'));
			 
			 h1.innerHTML = listName + "<span>Due on <strong>" + dueDate.toDateString() + "</strong></span>";
			 
			 this.hideCreateNewList(true);
		},
		hideCreateNewList: function(hideCreateNewList) {
			if (hideCreateNewList) {
				document.getElementById("createList").setAttribute("class", "hide");
				document.getElementById("input").removeAttribute("class", "");
				this.resetCreateListForm();
			}
			else {
				this.resetCreateListForm();
				document.getElementById("createList").removeAttribute("class", "");
				document.getElementById("input").setAttribute("class", "hide");
			}
		},
		renderAddition: function(name, num, status, indentation) {
		    var list 				= document.getElementById("list"),
		    	dv   				= document.createElement("div"),
		    	chbx  				= document.createElement('input'),
				label 				= document.createElement('input'),
				radio 				= document.createElement('span'),
				indentation 		= (indentation === 'none') ? false : indentation;
		
				chbx.type 			= "checkbox";
				chbx.name 			= (Array.isArray(name)) ? name[0] : name;
				chbx.setAttribute('data-count', num);

				label.value		 	= chbx.name;
				label.type 			= "text";
				label.title 		= "Edit Task";

				radio.setAttribute('class', 'radio');
				dv.setAttribute('draggable','true');
				dv.setAttribute('ondragstart','drag(event)');
				dv.setAttribute('id', Controller.counter);
				dv.appendChild(chbx);
				dv.appendChild(label);
				dv.appendChild(radio);

				if (indentation) dv.setAttribute('data-indent', indentation);

				if (Array.isArray(name) && name[1] !== null) {
					dv.setAttribute('class', name[1]);
					if (name[1] === 'completed') chbx.checked = true; 
		    	}
		    	else if (status === 'in progress') { 
		    		dv.setAttribute('class', 'in-progress');
		    	}
		    	else if (status === 'completed') {
		    		dv.setAttribute('class', status);
		    		chbx.checked = true;
		    	}

		    list.appendChild(dv);

		    // add event listeners to dynamically-created content
		    addEventHandler(chbx, 'change', function(evt) { // checkbx
		    	evt.stopPropagation();
		    	Controller.toggleChecked(evt);
			});
			 addEventHandler(radio, 'click', function(evt) {   // task div
			 	evt.stopPropagation();
		    	Controller.toggleSelected(evt); 
			});
			 addEventHandler(label, 'keyup', function(evt) { // checkbx
		    	evt.stopPropagation();
		    	console.log(num, this.value);
		    	Controller.updateTask(num, this.value);
			});
			// hide controls and meta
			View.hideListMetaControls(false);
	 	},
		updateTask: function(num, taskName) {
			console.log
			document.querySelectorAll('input[data-count="'+num+'"]')[0].setAttribute('name', taskName);
			console.log('%%');
		},
		updateCounts: function() {
			var tasks = document.querySelectorAll('#list input[data-count]');

			for (var i =0, ii = tasks.length; i < ii; i++) {
				tasks[i].setAttribute('data-count', i+1);
			}
		},
		removeTask: function(taskDIV) {
			var parent = taskDIV;
			
			while (parent !== null && parent.firstChild) {
			    parent.removeChild(parent.firstChild);
			}
			
			if (parent !== null) parent.remove();

			this.checkSelectNumber();
		},
		completed: function(chbx) {
			chbx.checked = true;
			chbx.parentElement.removeAttribute("class");
			chbx.parentElement.setAttribute("class", "completed");
		},
		updateStatus: function(chbx, status) {
			var taskDIV = chbx.parentElement,
				status  = (status === "in progress") ? "in-progress" : status;

			if (status === 'completed') { // check if completed
				chbx.checked = true;
			}
			else {
				chbx.checked = false;
			}
			taskDIV.removeAttribute("class");
			taskDIV.setAttribute("class", status);
			this.unselectTask(taskDIV);
		},
		incompleted: function(chbx) {
			chbx.checked = false;
			chbx.parentElement.removeAttribute("class");
		},
		selectTask: function(taskDIV) {
			var selectText = document.querySelectorAll('#meta span + span')[0];
			taskDIV.setAttribute('data-selected', 'true');
			selectText.setAttribute('class', 'orange');
			selectText.innerHTML = 'Deselect &xvee;';
		},
		unselectTask: function(taskDIV) {
			taskDIV.removeAttribute('data-selected');
			this.checkSelectNumber();
		},
		toggleSelect: function(select) {
			var tasks = document.querySelectorAll('#list > div');
			for (var i =0, ii = tasks.length; i < ii; i++) {
				if (select) { // select all unselected
					this.selectTask(tasks[i]);
				}
				else { // unselect all selected
					if (tasks[i].getAttribute('data-selected') === "true") {
						this.unselectTask(tasks[i]);
					}
				}
			}
		},
		checkSelectNumber: function() {
			if (document.querySelectorAll('[data-selected]').length < 1) {
				document.querySelectorAll('#meta span + span')[0].removeAttribute('class');
				document.querySelectorAll('#meta span + span')[0].innerHTML = 'Select &xvee;';
			}
		},
		indentTask: function(evt) {
			var indent  			= evt.currentTarget.getAttribute('data-indent'),
				selectedCollection 	= document.querySelectorAll('#list [data-selected]'),
				taskDIVisCollection = (selectedCollection.length > 0) ? true : false,
				taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;

			if (taskDIVisCollection) {
				for(var i =0, ii = taskDIV.length; i < ii; i++) {
					drawIndentation(indent, taskDIV[i]);
				}
			}
			else {
				drawIndentation(indent, taskDIV)
			}

			function drawIndentation(indent, taskDIV) {
				if (indent === 'left') {
					if (taskDIV.getAttribute('data-indent') === 'indentLeftLeft') {
						return;
					}
					else if (taskDIV.getAttribute('data-indent') === 'indentLeft') {
						taskDIV.setAttribute('data-indent', 'indentLeftLeft');
					}
					else {
						taskDIV.setAttribute('data-indent', 'indentLeft');
					}
				}
				else {
					if (taskDIV.getAttribute('data-indent') === 'indentLeftLeft') {
						taskDIV.setAttribute('data-indent', 'indentLeft');
					}
					else {
						taskDIV.removeAttribute('data-indent');
					}
				}
			}
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
	};
});
