/* App Module */
var TaskStoreID = 0;
//angular.module('fsa', ['taskFilters']).
var angApp = angular.module('fsa', [])

  .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.
          when('/login', { templateUrl: 'partials/login.html', controller: LoginController }).
          when('/tasks', { templateUrl: 'partials/tasks.html', controller: TasksController }).
          when('/tasks/:taskId', { templateUrl: 'partials/taskDetail.html', controller: TaskDetailController }).
          when('/tasks/:taskId/taskDetailMenu', { templateUrl: 'partials/taskDetailMenu.html', controller: TaskDetailMenuController }).
          when('/tasks/:taskId/notes', { templateUrl: 'partials/notes.html', controller: NotesController }).
          when('/tasks/:taskId/note', { templateUrl: 'partials/addnote.html', controller: AddUpdateNotesController }).
          when('/tasks/:taskId/notes/:noteId', { templateUrl: 'partials/updatenote.html', controller: AddUpdateNotesController }).
          otherwise({ redirectTo: '/login' });
  }])
  
 .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }])
  .run(function ($rootScope, $location) {
      // register listener to watch route changes
      $rootScope.$on("$locationChangeStart", function (event, next, current) {
          if (!fsaApp.session.isSessionAvailable()) {
              // no logged user, we should be going to #login
              if (next.templateUrl != "partials/Login.html") {
                  // not going to #/login, we should redirect now
                  TaskStoreID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
                  $location.path("/login");
                  alert(TaskStoreID);                
              }
          }
      });      
  });

//allows addition of tel: tag to phone as safe update
angApp.config(function ($compileProvider) {
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});
alert (templateUrl);
function LogOutMenu() {
    if ($('#LogOutDiv').css('display') == 'none') {
        $('#LogOutDiv').show();
        var timer = setTimeout(HideLogOutDiv, 4000);
    } else {
        $('#LogOutDiv').hide();
    }
}

function HideLogOutDiv() {
    $('#LogOutDiv').hide();
}

function LogOut() {
    fsaApp.session.removeSessionValue();
    $("#spanUserName").text("");
    fsaApp.showContextMenu("");
    LogOutMenu();
    TaskStoreID = 0;
}

/* Controllers */
function LoginController($scope, $location, $rootScope, $http) {
alert ('in login');
    //var LoginData = {
    //    'LoginID': 'rdunn',
    //    'Password': 'tams$123'
    //};
    //    for (var i = 0; i < 20; i++) {
    //        var rememberMe = $scope.rememberme;
    //        if (rememberMe === undefined) {
    //            rememberMe = false;
    //        }
    //        var jsonData = JSON.stringify(LoginData);
    //        showLoading(true);
    //        $http({
    //            method: "POST",
    //            url: "api/Login",
    //            contentType: "application/json; charset=utf-8",
    //            data: jsonData,
    //            dataType: "json",
    //            headers: fsaApp.session.getAuthenticationHeader(),
    //        })
    //        .success(function (data, status, headers, config) {
    //            //fsaApp.session.setSessionValue(data, rememberMe);
    //            //if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
    //            //    $("#spanUserName").text(fsaApp.session.getUserName());
    //            //}
    //            //showSignOutMenu();
    //            //if (TaskStoreID > 0) {
    //            //    $location.path("/tasks/" + TaskStoreID);
    //            //} else {
    //            //    $location.path("/tasks");
    //            //}
    //        })
    //        .error(function (data, status, headers, config) {
    //            //display error in a label            
    //            showLoading(false);
    //            alert("Login Error: " + JSON.stringify(data));
    //        });
    //    }
        //setTimeout($location.path("/login"), 5000);
		
        $('#LoginDiv').show();
        showLoading(false);
        fsaApp.setPageTitle("STARS");
        $('#leftBars').html('<img src="Images/LeftBars.png" height="25px" width="45px" align="center" />');
        $scope.verifyLogin = function () {

            var loginid = $scope.username;
            var pwd = $scope.password;
            var rememberMe = $scope.rememberme;
            if (rememberMe === undefined) {
                rememberMe = false;
            }
            var LoginData = {
                'LoginID': loginid,
                'Password': pwd
            };
            var jsonData = JSON.stringify(LoginData);
            showLoading(true);
			$http.defaults.useXDomain = true;
            $http({
                method: "POST",
               // url: "https://fsadev.tams.com/api/Login",
                url: "api/login",   
                contentType: "application/json; charset=utf-8",
                data: jsonData,
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader(),
            })
            .success(function (data, status, headers, config) {
                fsaApp.session.setSessionValue(data, rememberMe);
                if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
                    $("#spanUserName").text(fsaApp.session.getUserName());
                }
                showSignOutMenu();
                if (TaskStoreID > 0) {
                    $location.path("/tasks/" + TaskStoreID);
                } else {
                    $location.path("/tasks");
                }
            })
            .error(function (data, status, headers, config) {
                //display error in a label            
                showLoading(false);
                alert("Login Error: " + data);
            });
        }
    
}


function LoginController_bk($scope, $location, $rootScope, $http) {
alert ('in login');
    if (fsaApp.session.isSessionAvailable()) {
        $location.path('/tasks');
        showSignOutMenu();
    }
    else
    {
        $('#LoginDiv').show();
        showLoading(false);
        fsaApp.setPageTitle("STARS");
        $('#leftBars').html('<img src="Images/LeftBars.png" height="25px" width="45px" align="center" />');
        $scope.verifyLogin = function () {

            var loginid = $scope.username;
            var pwd = $scope.password;
            var rememberMe = $scope.rememberme;
            if (rememberMe === undefined) {
                rememberMe = false;
            }
            var LoginData = {
                'LoginID': loginid,
                'Password': pwd
            };
            var jsonData = JSON.stringify(LoginData);
            showLoading(true);
            $http({
                method: "POST",
               // url: "api/Login",
               url: "https://fsadev.tams.com/api/Login",
                contentType: "application/json; charset=utf-8",
                data: jsonData,
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader(),
            })
            .success(function (data, status, headers, config) {
                fsaApp.session.setSessionValue(data, rememberMe);
                if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
                    $("#spanUserName").text(fsaApp.session.getUserName());
                }
                showSignOutMenu();
                if (TaskStoreID > 0) {
                    $location.path("/tasks/" + TaskStoreID);
                } else {
                    $location.path("/tasks");
                }
            })
            .error(function (data, status, headers, config) {
                //display error in a label            
                showLoading(false);
                alert("Login Error: " + data);
            });
        }
    }
    
}

function TasksController($scope, $location, $http) {   
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }

    fsaApp.showContextMenu("");
    fsaApp.setPageTitle("STARS");
    $scope.currentView = 'Assigned';
    $scope.totalAssigned = 0;
    $scope.totalOpen = 0;
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader(),
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.tasks = data;
        transformOpenTasks();
        $scope.taskFilter = {};
        $scope.taskFilter.xStatus = 'Assigned';
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if ((status == 401) || (status == 0)) {
            fsaApp.session.removeSessionValue();
            $location.path("/login");
        }
        else {
            //display error in a label
            alert("Error in retrieving tasks: " + JSON.stringify(data));
        }
    });

    function transformOpenTasks() {
        //apply transformation on all elements.
        return $scope.tasks.filter(function (elem) {
            elem.CustomerName = ProperCase(elem.CustomerName);
            switch (elem.Status.toLowerCase()) {
                case 'assigned':
                    elem.xStatus = 'assigned';
                    elem.xImage = 'Assigned.png';
                    $scope.totalAssigned += 1;
                    break;
                case 'waiting for parts':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Waiting.png';
                    $scope.totalOpen += 1;
                    break;
                case 'waiting for test equipment':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Waiting.png';
                    $scope.totalOpen += 1;
                    break;
                case 'waiting for po':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Waiting.png';
                    $scope.totalOpen += 1;
                    break;
                case 'system unavailable':
                    elem.xStatus = 'Open';
                    elem.xImage = 'SystemUnavailable.png';
                    $scope.totalOpen += 1;
                    break;                
                case 'open':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Open.png';
                    $scope.totalOpen += 1;
                    break;
                case 'accepted':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Accepted.png';
                    $scope.totalOpen += 1;
                    break;
                case 'working':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Working.png';
                    $scope.totalOpen += 1;
                    break;
                case 'completed':
                    elem.xStatus = 'Open';
                    elem.xImage = 'Completed.png';
                    $scope.totalOpen += 1;
                    break;
            }
            
            return true;
        });
    }

    $scope.filterTaskView = function (filterValue) {
        $scope.taskFilter.xStatus = filterValue;
        $scope.currentView = filterValue;
    }
}

function TaskDetailController($scope, $routeParams, $http) {
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");
    $scope.statusOptions = [
    { name: 'Accept'},
    { name: 'Assigned'}
    ];
    $scope.statusOption = $scope.statusOptions[1];
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader(),
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.tskD = data;
        $scope.mobileBrowser = 'No';
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.ENT.EntContractNumber === undefined || $scope.tskD.ENT.EntContractNumber == '' || $scope.tskD.ENT.EntContractNumber == null) {
            $scope.tskD.ENT.ShowDiv = 0;
        } else {
            $scope.tskD.ENT.ShowDiv = 1;
        }
        if ($scope.tskD.TSK.Phone != '') {
            if (jQuery.browser.mobile) {
                $scope.mobileBrowser = 'Yes';
            }
        }
        $scope.tskD.SCH.SchPlannedStartDate = convertDateFormat($scope.tskD.SCH.SchPlannedStartDate);
        $scope.tskD.SCH.SchPlannedEndDate = convertDateFormat($scope.tskD.SCH.SchPlannedEndDate);
        $scope.tskD.SCH.SchScheduledStartDate = convertDateFormat($scope.tskD.SCH.SchScheduledStartDate);
        $scope.tskD.SCH.SchScheduledEndDate = convertDateFormat($scope.tskD.SCH.SchScheduledEndDate);
        $scope.tskD.ENT.EntContractStart = convertDateFormat($scope.tskD.ENT.EntContractStart);
        $scope.tskD.ENT.EntContractEnd = convertDateFormat($scope.tskD.ENT.EntContractEnd);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
         if ((status == 401) || (status == 0)) {
                TaskStoreID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
                setCookie("fsaSessionObject","",-2);
                $location.path("/login");
        }
        else {
            //display error in a label
            alert("Error in retrieving task details: " + data);
            $location.path("/tasks");
        }
    });

    $scope.currentDiv = 1;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assign')
        {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader(),
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                alert("Task is now assigned to another User.");
                $location.path("/tasks");
            } else {
                alert("Task successfully updated.");
                $scope.tskD.TSK.Status = "Accepted";
                $location.path("/tasks/" + $routeParams.taskId);
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status ==0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                alert("Error in accepting task: " + data);
            }
        });
    }
}

function TaskDetailMenuController($scope, $routeParams) {
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");

    $scope.taskId = $routeParams.taskId;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "'><img src='images/Three-Dots.png' height='28px' /></a>");
}

function NotesController($scope, $location, $routeParams, $http) {
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.showContextMenu("");
    fsaApp.setPageTitle("STARS");

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }

    $scope.showAddNote = function () {
        $location.path("/tasks/" + $routeParams.taskId + "/note");
    }

    fsaApp.setPageTitle("STARS");
    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.statusOption = $scope.statusOptions[1];
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader(),
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if ((status == 401) || (status == 0 )) {
            $location.path("/login");
        }
        else {
            //display error in a label
            alert("Error in retrieving task details: " + data);
        }
    });

    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId + "/Notes",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader(),
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.notes = data;
        
        for (var i = 0; i < $scope.notes.length; i++) { 
            $scope.notes[i].NOTE = $scope.notes[i].NOTE.replace(/\n\r?/g, '<br />');
            $scope.notes[i].Note2 = deprecateNote($scope.notes[i].NOTE, $routeParams.taskId,i);
            if ($scope.notes[i].NOTE.length > 130) {
                $scope.notes[i].NOTE += " <a href='#/tasks/" + $routeParams.taskId + "/notes' onclick='readMoreToggle(this.parentElement)'>less...</a>";
            }
            $scope.notes[i].showMore = 0;
        }
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if ((status == 401) || (status ==0)) {
            $location.path("/login");
        }
        else {
            //display error in a label
            alert("Error in retrieving notes: " + data);
        }
    });

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assign') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader(),
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                alert("Task is now assigned to another User.");
                $location.path("/tasks");
            } else {
                alert("Task successfully updated.");
                $scope.tskD.TSK.Status = "Accepted";
                $location.path("/tasks/" + $routeParams.taskId);
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0 )) {
                $location.path("/login");
            }
            else {
                //display error in a label
                alert("Error in accepting task: " + data);
            }
        });
    }
}

function AddUpdateNotesController($scope, $location, $routeParams, $http) {
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");

    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.statusOption = $scope.statusOptions[1];
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader(),
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            alert("Error in retrieving task details: " + data);
        }
    });

    $scope.addNote = function () {
        if ($scope.noteType === undefined || $scope.noteType.replace(/\s+/g, ' ') == "") {
            alert('Note Type cannnot be empty.');
            return;
        }
        if ($scope.noteNotes === undefined || $scope.noteNotes.replace(/\s+/g, ' ') == "") {
            alert('Description cannnot be empty.');
            return;
        }
        var note = {
            NoteType : $scope.noteType,
            Notes : $scope.noteNotes//.replace(/\n\r?/g, '<br />')
        }

        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Note",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(note),
            headers: fsaApp.session.getAuthenticationHeader(),
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            alert("Note successfully added.");
            $location.path("/tasks/" + $routeParams.taskId + "/notes");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                alert("Error in adding note: " + data);
            }
        });
    }

    $scope.BackToNotes = function () {
        $location.path('/tasks/' + $routeParams.taskId + '/notes');
    }

    $scope.updateNote = function () {
        var note = {
            NoteType: $scope.nt.Type,
            Notes: $scope.nt.notes
        }

        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Note",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            headers: fsaApp.session.getAuthenticationHeader(),
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            alert("Note successfully added.");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                alert("Error in adding note: " + status);
            }
        });
    }

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assign') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader(),
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                alert("Task is now assigned to another User.");
                $location.path("/tasks");
            } else {
                alert("Task successfully updated.");
                $scope.tskD.TSK.Status = "Accepted";
                $location.path("/tasks/" + $routeParams.taskId);
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                alert("Error in accepting task: " + data);
            }
        });
    }
}

function EnterLogin (event) {
    if (event.which == 13) {
        var mScope = angular.element(document.getElementById("Text1")).scope();
        mScope.verifyLogin();
    }
}

function ProperCase(sent) {
    var tempArray = sent.split(" ");
    var returnString = "";
    for (var i = 0; i < tempArray.length; i++) {
        returnString += tempArray[i][0];
        for (var j = 1; j < tempArray[i].length; j++) {
            returnString += tempArray[i][j].toLowerCase();
           
        }
        returnString += " ";
    }
    return returnString;
}

function showLoading(show)
{
    if (show) {
        $('#curtain').show();
        $('#hourGlass').show();
    } else {
        $('#curtain').hide();
        $('#hourGlass').hide();
    }

}

function convertDateFormat(date) {
    var day = date.substr(0, date.lastIndexOf('T'))
    var time = date.substr(date.lastIndexOf('T') + 1)
    day = day.split('-');
    if (day[0] == '0001') {
        return 'N/A';
    }
    day = day[1] + '-' + day[2] + '-' + day[0];
    time = time.split(':');
    var hour = 'AM';
    if (time[0] >= 12) {
        hour = 'PM';
    }
    if (time[0] > 12) {
        time[0] = time[0] - 12;
    }
    if (time[0] == 0) {
        time[0] = 12;
    }
    time = time[0] + ':' + time[1];
    return day + ' ' + time + ' ' + hour;
}

function deprecateNote(noteDesc, taskID, i) {
    var tempNote = "";
    if (noteDesc.length > 130) {
        tempNote = noteDesc.substr(0, 100);
        if (tempNote.lastIndexOf("<") > tempNote.lastIndexOf(">")) {
            tempNote += ">";
        }
        tempNote += " <a href='#/tasks/" + taskID + "/notes' onclick='readMoreToggle(this.parentElement)'>more...</a>";
    } else {
        tempNote = noteDesc;
    }
    return tempNote;
}

function readMoreToggle(elem) {
    for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
        if (elem.parentNode.childNodes[i].nodeName == 'TD') {
            if (elem.parentNode.childNodes[i].style.display == 'none') {
                elem.parentNode.childNodes[i].style.display = '';
            } else {
                elem.parentNode.childNodes[i].style.display = 'none';
            }
        }
    }
}

function showSignOutMenu() {
    var lbhtml = '<a onclick="LogOutMenu();" style="text-decoration:none; cursor:pointer;"><img src="Images/LeftBars.png" height="25px" width="45px" align="center" /></a><div id="LogOutDiv" style="display:none; position:relative;  width:100%; text-align:left; z-index:100;width:95px; left:-2px; top:5px;"><ul id="leftMenuLogOut" style="position:absolute;" ><li><span id="spanUserName" style="color: black; cursor:pointer;"></span></li><li><a href="#" style="color:black; text-decoration:none;" onclick="LogOut();">Sign-Out</a></li></ul></div>';
    $('#leftBars').html(lbhtml);
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}