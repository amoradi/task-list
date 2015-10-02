// Model module
define(['./addEventHandler', './task'], function() {
	return Model = function() {
		var _model 	= {},
			name,
			dueDate,
			counter = 0;

		function _resetModel() {
			for (var member in _model) {
				_removeTask(member);
			}
			counter = 0;
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
			counter = task_num -1;
			delete _model[task_num]; 
		}

		function _updateTask(task_num, taskName) {
			_model[task_num].name = taskName;
		}

		function _checkTask(task_num) {
			_model[task_num].status = 'completed';
		}

		function _updateStatus(task_num, status) {
			_model[task_num].status = status;
		}

		function _uncheckTask(task_num) {
			_model[task_num].status = 'incomplete';
		}

		function _indentTask(evt) {
			// know what btn was clicked
			// if tasks are selected, for each one, update there indentation property
			// else update indentation property for last obj in Model
			var indent  			= evt.currentTarget.getAttribute('data-indent'),
				selectedCollection 	= document.querySelectorAll('#list [data-selected]'),
				taskDIVisCollection = (selectedCollection.length > 0) ? true : false,
				taskDIV 			= (taskDIVisCollection) ? selectedCollection : document.getElementById('list').lastElementChild;

			if (taskDIVisCollection) {
				for(var i =0, ii = taskDIV.length; i < ii; i++) {
					var task_num = taskDIV[i].firstElementChild.getAttribute('data-count');
					saveIndentation(task_num, indent);
				}
			}
			else {
				var task_num = taskDIV.firstElementChild.getAttribute('data-count');
				saveIndentation(task_num, indent)
			}

			function saveIndentation(task_num, indent) {
				if (indent === 'left') {
					if (_model[task_num].indentation === 'indentLeftLeft') {
						return;
					}
					else if (_model[task_num].indentation === 'indentLeft') {
						_model[task_num].indentation = 'indentLeftLeft';
					}
					else {
						_model[task_num].indentation = 'indentLeft';
					}
				}
				else {
					if (_model[task_num].indentation === 'indentLeftLeft') {
						_model[task_num].indentation = 'indentLeft';
					}
					else {
						_model[task_num].indentation = 'none';
					}
				}
			}
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
			updateTask: _updateTask,
			checkTask: _checkTask,
			updateStatus: _updateStatus,
			uncheckTask: _uncheckTask,
			indentTask: _indentTask,
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
});