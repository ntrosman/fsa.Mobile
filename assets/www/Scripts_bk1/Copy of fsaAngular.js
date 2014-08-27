/* App Module */
var TaskStoreID = 0;
//angular.module('fsa', ['taskFilters']).
var fsaModule = angular.module('fsa', ['$strap.directives'])
  .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.
          when('/login', { templateUrl: 'partials/login.html', controller: LoginController }).
          when('/tasks', { templateUrl: 'partials/tasks.html', controller: TasksController }).
          when('/tasks/rtnTsk/:tskRtnMsg', { templateUrl: 'partials/tasks.html', controller: TasksController }).
          when('/tasks/:taskId', { templateUrl: 'partials/taskDetail.html', controller: TaskDetailController }).
          when('/tasks/:taskId/rtnTsk/:tskRtnMsg', { templateUrl: 'partials/taskDetail.html', controller: TaskDetailController }).
          when('/tasks/:taskId/taskDetailMenu', { templateUrl: 'partials/taskDetailMenu.html', controller: TaskDetailMenuController }).
          when('/tasks/:taskId/notes', { templateUrl: 'partials/notes.html', controller: NotesController }).
          when('/tasks/:taskId/notes/rtnNte/:ntsRtnMsg', { templateUrl: 'partials/notes.html', controller: NotesController }).
          when('/tasks/:taskId/note', { templateUrl: 'partials/addnote.html', controller: AddUpdateNotesController }).
          when('/tasks/:taskId/notes/:noteId', { templateUrl: 'partials/updatenote.html', controller: AddUpdateNotesController }).
          when('/tasks/:taskId/labors', { templateUrl: 'partials/labors.html', controller: LaborsController }).
          when('/tasks/:taskId/labors/rtnLbr/:lbrRtnMsg', { templateUrl: 'partials/labors.html', controller: LaborsController }).
          when('/tasks/:taskId/labor', { templateUrl: 'partials/addLabor.html', controller: AddUpdateLaborsController }).
          when('/tasks/:taskId/labor/:laborId', { templateUrl: 'partials/addLabor.html', controller: AddUpdateLaborsController }).
          when('/tasks/:taskId/po', { templateUrl: 'partials/enterPO.html', controller: TaskDetailController }).
          when('/tasks/:taskId/managerApproval', { templateUrl: 'partials/managerApproval.html', controller: TaskDetailController }).
          when('/tasks/:taskId/changeCounter', { templateUrl: 'partials/changeCounter.html', controller: TaskDetailController }).
          when('/tasks/:taskId/changeStatus', { templateUrl: 'partials/changeStatus.html', controller: TaskDetailController }).
          when('/tasks/:taskId/changeEta', { templateUrl: 'partials/changeEta.html', controller: TaskDetailController }).
          when('/tasks/:taskId/changePriority', { templateUrl: 'partials/changePriority.html', controller: TaskDetailController }).
          when('/tasks/:taskId/tamsDown', { templateUrl: 'partials/tamsDown.html', controller: TaskDetailController }).
          when('/tasks/:taskId/fdaQuestions', { templateUrl: 'partials/fdaQuestions.html', controller: FDAsController }).
          when('/tasks/:taskId/fdaQuestions/:lbrTskStsUpd', { templateUrl: 'partials/fdaQuestions.html', controller: FDAsController }).
          when('/tasks/:taskId/faxEmail', { templateUrl: 'partials/faxEmail.html', controller: TaskDetailController }).
          when('/tasks/:taskId/activeContracts', { templateUrl: 'partials/activeContracts.html', controller: ActiveContractsController }).
          when('/tasks/:taskId/activeContracts/:activeContractID', { templateUrl: 'partials/activeContractDetails.html', controller: ActiveContractDetailsController }).
          when('/searchTask', { templateUrl: 'partials/searchTasks.html', controller: SearchTasksController }).
          when('/inventory', { templateUrl: 'partials/inventory.html', controller: InventoryController }).
          when('/inventory/:savedLocationID', { templateUrl: 'partials/inventory.html', controller: InventoryController }).
          when('/inventory/:savedLocationID/detail/:inventoryID', { templateUrl: 'partials/inventoryDetail.html', controller: InventoryDetailController }).
          when('/tasks/:taskId/create', { templateUrl: 'partials/createTask.html', controller: CreateTaskController }).
          when('/tasks/:taskId/materials', { templateUrl: 'partials/materials.html', controller: MaterialsController }).
          when('/whereAbout', { templateUrl: 'partials/whereAbout.html', controller: WhereAboutController }).
          otherwise({ redirectTo: '/login' });
  }])

  .run(function ($rootScope, $location, $routeParams) {
      // register listener to watch route changes
      $('body').tooltip('disable');
      $rootScope.$on("$locationChangeStart", function (event, next, current) {
          if (!fsaApp.session.isSessionAvailable()) {
              // no logged user, we should be going to #login
              if (next.templateUrl != "partials/Login.html") {
                  // not going to #/login, we should redirect now
                  TaskStoreID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
                  $location.path("/login");
              }
          }
      });
      $rootScope.lbrDbrf = 0;
      $rootScope.currentTime = function (attrs) {
          return attrs.myCurrentTime;
      }
  });

//allows addition of tel: tag to phone as safe update
fsaModule.config(function ($compileProvider) {
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

/* Controllers */
function LoginController($scope, $location, $rootScope, $http, $routeParams) {
    disableToolTip();
    if (fsaApp.session.isSessionAvailable()) {
        $location.path('/tasks');
        showSignOutMenu();
    } else {
        showAnchorLogo(true);
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
                url: "api/Login",
                contentType: "application/json; charset=utf-8",
                data: jsonData,
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                fsaApp.session.setSessionValue(data, rememberMe);
                if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
                    $("#spanUserName").text(fsaApp.session.getUserName());
                }
                //showLoading(false);
                showSignOutMenu();
                $routeParams.isLoginScreen = 0;
                if (TaskStoreID > 0) {
                    $location.path("/tasks/" + TaskStoreID);
                } else {
                    $location.path("/tasks");
                }
            })
            .error(function (data, status, headers, config) {
                //display error in a label
                showLoading(false);
                $scope.password = '';
                $('#loginError').html("Error: " + data.ExceptionMessage);
                showTimedElem('loginError');
            });
        }
    }

}
LoginController.$inject = ['$scope', '$location', '$rootScope', '$http', '$routeParams'];
fsaModule.controller('LoginController', LoginController);

function TasksController($rootScope, $scope, $location, $http, $routeParams) {
    disableToolTip();
    showAnchorLogo(false);
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    if ($routeParams.tskRtnMsg !== undefined) {
        if ($routeParams.tskRtnMsg == "rtvTskDetMsg") {
            $('#tskErrMain').html("Error in retrieving task details");
            showTimedElem('tskErrMain');
        }
        if ($routeParams.tskRtnMsg == "WAUpdate") {
            $('#tskMsg').html("Whereabouts updated successfully.");
            showTimedElem('tskMsg');
        }
        if ($routeParams.tskRtnMsg == "createTaskMsg") {
            $('#tskMsg').html("Task created successfully.");
            showTimedElem('tskMsg');
        }
    }
    fsaApp.showContextMenu("");
    fsaApp.setPageTitle("STARS");
    $scope.currentView = 'Assigned';
    $scope.totalAssigned = 0;
    $scope.totalOpen = 0;
    showLoading(true);

if (window.navigator.onLine){
	alert('server db');
}else{
	alert('server db');
}

<project name="project" default="default">
    <description>
            description
    </description>

    <!-- ================================= 
          target: default              
         ================================= -->
    <target name="default" depends="depends" description="description">
        
    </target>

    <!-- - - - - - - - - - - - - - - - - - 
          target: depends                      
         - - - - - - - - - - - - - - - - - -->
    <target name="depends">
    </target>

</project>

    $http({
        method: "GET",
        url: "api/Tasks",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
    
    console.log('getting offline data');

        var allTasks = JSON.parse(window.localStorage.getItem('tasks'));
        var localtask = [];
        for(var i=0; i<allTasks.length; i++) {
            localtask.push(allTasks[i]);
            console.log(LocalTask);
        }
        
console.log('pg, success');
        if (data.length > 0) {
         var tasksList = JSON.parse(window.localStorage.getItem('tasks'));
         console.log(taslsList);
            $scope.pouchdb = new PouchDB('STARS_TASKS', function (err, db) {
                console.log('pouchdb created');
                if (err) {
                    alert(err);
                } else {
                    db.allDocs({ include_docs: true }, function (err, node) {
                        if (err) {
                            alert(err);
                        } else {
                            data.forEach(function (node) {
                                node._id = node.ID;
                                node.Type = "Task";
                                node.UserID = $scope.username;
                                db.put(node);
                            });
                        }
                    });
                    $scope.apply($scope.loadAllTasks(db));
                }
            });

        }

        $scope.loadAllTasks = function (db) {
            db.allDocs(function (err, response) {
                if (err) {
                    alert(err);
                } else {
                    $scope.tasks = new Array();
                    for (var i = 0; i < response.rows.length; i++) {
                        //   console.log('response.rows[i].id: ' + response.rows[i].id);
                        db.get(response.rows[i].id, function (err, doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                $scope.tasks.push(doc);
                            }
                            //   console.log('$scope.tasks.length: ' + $scope.tasks.length);
                            //   console.log('response.rows.length: ' + response.rows.length);
                            if ($scope.tasks.length == response.rows.length) {
                                //       $scope.transformOpenTasks();
                                transformOpenTasks();
                                $scope.taskFilter = {};
                                $scope.taskFilter.xStatus = 'Assigned';
                                $scope.$apply();
                                showLoading(false);
                                console.log('loading tasks');
                            }
                        });
                    }
                }
            });
        }
       
//        showLoading(false);
//        $scope.tasks = data;
//        transformOpenTasks();
//        $scope.taskFilter = {};
//        $scope.taskFilter.xStatus = 'Assigned';
    })
    .error(function (data, status, headers, config) {
console.log('pg, error');
        $scope.pouchdb = new PouchDB('STARS_TASKS', function (err, db) {
            console.log('pouchdb created to pull data out');
            if (err) {
                alert(err);
            } else {
                $scope.apply($scope.loadTasks(db));
            }
        });

        $scope.loadTasks = function (db) {
            db.allDocs(function (err, response) {
                if (err) {
                    alert(err);
                } else {
                    $scope.tasks = new Array();
                    for (var i = 0; i < response.rows.length; i++) {
                        //   console.log('response.rows[i].id: ' + response.rows[i].id);
                        db.get(response.rows[i].id, function (err, doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                $scope.tasks.push(doc);
                            }
                            //   console.log('$scope.tasks.length: ' + $scope.tasks.length);
                            //   console.log('response.rows.length: ' + response.rows.length);
                            if ($scope.tasks.length == response.rows.length) {
                                showLoading(false);
                                $scope.$apply();
                                //  $scope.transformOpenTasks();
                                transformOpenTasks();
                                $scope.taskFilter = {};
                                $scope.taskFilter.xStatus = 'Assigned';
                            }
                        });
                    }
                }
            });
        }

        /*
        showLoading(false);
        if ((status == 401) || (status == 0)) {
            fsaApp.session.removeSessionValue();
            $location.path("/login");
        }
        else {
            //display error in a label
            $('#tskErrMain').html("Error: " + data.ExceptionMessage);
            showTimedElem('tskErrMain');
        }
        */
    });

    if (isIPhone()) {
        $(window).on("orientationchange", function (event) {
            $scope.currentView = 'Assigned';
            $scope.totalAssigned = 0;
            $scope.totalOpen = 0;
            showLoading(true);
            $http({
                method: "GET",
                url: "api/Tasks",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
console.log('pg, iphone, success');
                //////////////////////////////////////

                if (data.length > 0) {
                    $scope.pouchdb = new PouchDB('STARS_TASKS', function (err, db) {
                        console.log('pouchdb created');
                        if (err) {
                            alert(err);
                        } else {
                            db.allDocs({ include_docs: true }, function (err, node) {
                                if (err) {
                                    alert(err);
                                } else {
                                    data.forEach(function (node) {
                                        node._id = node.ID;
                                        node.Type = "Task";
                                        node.UserID = $scope.username;
                                        db.put(node);
                                    });
                                }
                            });
                            $scope.apply($scope.loadAllTasks(db));
                        }
                    });

                }
/*
                $scope.loadAllTasks = function (db) {
                    db.allDocs(function (err, response) {
                        if (err) {
                            alert(err);
                        } else {
                            $scope.tasks = new Array();
                            for (var i = 0; i < response.rows.length; i++) {
                                //   console.log('response.rows[i].id: ' + response.rows[i].id);
                                db.get(response.rows[i].id, function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        $scope.tasks.push(doc);
                                    }
                                    //   console.log('$scope.tasks.length: ' + $scope.tasks.length);
                                    //   console.log('response.rows.length: ' + response.rows.length);
                                    if ($scope.tasks.length == response.rows.length) {
                                        //       $scope.transformOpenTasks();
                                        transformOpenTasks();
                                        $scope.taskFilter = {};
                                        $scope.taskFilter.xStatus = 'Assigned';
                                        $scope.$apply();
                                        showLoading(false);
                                    }
                                });
                            }
                        }
                    });
                }
                */
                 //       showLoading(false);
                /////////////////////////
                                showLoading(false);
                                $scope.tasks = data;
                                transformOpenTasks();
                                $scope.taskFilter = {};
                                $scope.taskFilter.xStatus = 'Assigned';
            })
            .error(function (data, status, headers, config) {
console.log('pg, iphone, error');
                $scope.pouchdb = new PouchDB('STARS_TASKS', function (err, db) {
                    console.log('pouchdb created to pull data out');
                    if (err) {
                        alert(err);
                    } else {
                        $scope.apply($scope.loadTasks(db));
                    }
                });

                $scope.loadTasks = function (db) {
                    db.allDocs(function (err, response) {
                        if (err) {
                            alert(err);
                        } else {
                            $scope.tasks = new Array();
                            for (var i = 0; i < response.rows.length; i++) {
                                //   console.log('response.rows[i].id: ' + response.rows[i].id);
                                db.get(response.rows[i].id, function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        $scope.tasks.push(doc);
                                    }
                                    //   console.log('$scope.tasks.length: ' + $scope.tasks.length);
                                    //   console.log('response.rows.length: ' + response.rows.length);
                                    if ($scope.tasks.length == response.rows.length) {
                                        showLoading(false);
                                        $scope.$apply();
                                        //  $scope.transformOpenTasks();
                                        transformOpenTasks();
                                        $scope.taskFilter = {};
                                        $scope.taskFilter.xStatus = 'Assigned';
                                    }
                                });
                            }
                        }
                    });
                }

                /*
                                showLoading(false);
                                if ((status == 401) || (status == 0)) {
                                    fsaApp.session.removeSessionValue();
                                    $location.path("/login");
                                }
                                else {
                                    //display error in a label
                                    $('#tskErrMain').html("Error: " + data.ExceptionMessage);
                                    showTimedElem('tskErrMain');
                                }
                            });
                           
                        });
                       */
            });
        });
    }
/*
    if (isIPhone()) {
        $(window).on("orientationchange", function (event) {
            $scope.currentView = 'Assigned';
            $scope.totalAssigned = 0;
            $scope.totalOpen = 0;
            showLoading(true);
            $http({
                method: "GET",
                url: "api/Tasks",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
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
                    $('#tskErrMain').html("Error: " + data.ExceptionMessage);
                    showTimedElem('tskErrMain');
                }
            });
        });
    }
*/

    function transformOpenTasks() {
        //apply transformation on all elements.
        return $scope.tasks.filter(function (elem) {
            elem.CustomerName = ProperCase(elem.CustomerName);
            if (isIPhone()) {
                if (window.orientation == 0 || window.orientation == 180) {
                    if (elem.CustomerName.length > 16) {
                        elem.CustomerName = elem.CustomerName.substr(0, 12) + '...';
                    }

                    if (elem.TaskName.length > 20) {
                        elem.TaskName = elem.TaskName.substr(0, 16) + '...';
                    }
                } else {
                    if (elem.CustomerName.length > 32) {
                        elem.CustomerName = elem.CustomerName.substr(0, 28) + '...';
                    }

                    if (elem.TaskName.length > 40) {
                        elem.TaskName = elem.TaskName.substr(0, 36) + '...';
                    }
                }
            }
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
TasksController.$inject = ['$rootScope', '$scope', '$location', '$http', '$routeParams'];
fsaModule.controller('TasksController', TasksController);

function TaskDetailController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    $scope.currentDateTime = new Date();
    if ($('#changeStatus') != null && $('#changeStatus') !== undefined && $('#tamsDown') != null && $('#tamsDown') !== undefined) {
        $('#changeStatus').show();
        $('#tamsDown').hide();
    }
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");
    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.statusOption = $scope.statusOptions[1];
    $scope.managerApprovalTemp = "";
    $scope.managerApproval = "";
    $scope.systemUpDate = $filter('date')(new Date(), 'MM-dd-yyyy');
    $scope.systemUpTime = $filter('date')(new Date(), 'hh:mm a').toString();
    $scope.sysDown = 'No';
    $scope.sysAvailable = 'No';
    $scope.cfmDown = '2';
    $scope.sysUpDate = new Date();
    showLoading(true);
    $.fn.timepicker.defaults = {
        defaultTime: 'current',
        disableFocus: false,
        isOpen: false,
        minuteStep: 15,
        modalBackdrop: false,
        secondStep: 15,
        showSeconds: false,
        showInputs: false,
        showMeridian: true,
        template: 'dropdown',
        appendWidgetTo: '.bootstrap-timepicker'
    };


    /*task update messages*/
    if ($routeParams.tskRtnMsg !== undefined) {
        if ($routeParams.tskRtnMsg == "chStatusMsg") {
            $("#tskMsg").html("Status changed successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chPriorityMsg") {
            $("#tskMsg").html("Priority changed successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chETAMsg") {
            $("#tskMsg").html("ETA changed successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chFdaMsg") {
            $("#tskMsg").html("FDA updated successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chTmDwnMsg") {
            $("#tskMsg").html("TAMS down updated successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chMgrAppMsg") {
            $("#tskMsg").html("Manager Approval updated successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chPOMsg") {
            $("#tskMsg").html("PO number updated successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chCounterMsg") {
            $("#tskMsg").html("Counter changed successfully.");
            showTimedElem('tskMsg');
        }

        if ($routeParams.tskRtnMsg == "chFxElMsg") {
            $("#tskMsg").html("Fax/Email sent successfully.");
            showTimedElem('tskMsg');
        }
    }
    /**********************/
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.mobileBrowser = 'No';
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
            if ($location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "changestatus" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "po" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "managerapproval" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "changecounter" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "changeeta" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "changepriority" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "tamsdown" || $location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "faxemail") {
                $location.path("/tasks/" + $routeParams.taskId);
            }
            fsaApp.showContextMenu("<img src='images/Three-Dots.png' height='28px' />");
        }

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
        $scope.tskD.SCH.SchScheduledStartDateOnly = $scope.tskD.SCH.SchScheduledStartDate.toString().substr(0, $scope.tskD.SCH.SchScheduledStartDate.toString().indexOf(" "));
        $scope.tskD.SCH.SchScheduledStartTimeOnly = $scope.tskD.SCH.SchScheduledStartDate.toString().substr($scope.tskD.SCH.SchScheduledStartDate.toString().indexOf(" ") + 1);
        $scope.tskD.SCH.SchScheduledEndDate = convertDateFormat($scope.tskD.SCH.SchScheduledEndDate);
        $scope.tskD.SCH.SchScheduledEndDateOnly = $scope.tskD.SCH.SchScheduledEndDate.toString().substr(0, $scope.tskD.SCH.SchScheduledEndDate.toString().indexOf(" "));
        $scope.tskD.SCH.SchScheduledEndTimeOnly = $scope.tskD.SCH.SchScheduledEndDate.toString().substr($scope.tskD.SCH.SchScheduledEndDate.toString().indexOf(" ") + 1);
        $scope.tskD.ENT.EntContractStart = convertDateFormat($scope.tskD.ENT.EntContractStart);
        $scope.tskD.ENT.EntContractEnd = convertDateFormat($scope.tskD.ENT.EntContractEnd);
        if ($scope.tskD.SCH.SchScheduledStartDateOnly == "") {
            $scope.scheduleStartDate = (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear();
        } else {
            $scope.scheduleStartDate = $filter('date')($scope.tskD.SCH.SchScheduledStartDateOnly, 'MM-dd-yyyy');
        }
        if ($scope.tskD.SCH.SchScheduledStartTimeOnly == "N/A") {
            $scope.scheduleStartTime = convertToAmPm(new Date().getHours() + ":" + new Date().getMinutes());
        } else {
            $scope.scheduleStartTime = $scope.tskD.SCH.SchScheduledStartTimeOnly;
        }
        if ($scope.tskD.SCH.SchScheduledEndDateOnly == "") {
            $scope.scheduleEndDate = (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear();
        } else {
            $scope.scheduleEndDate = $filter('date')($scope.tskD.SCH.SchScheduledEndDateOnly, 'MM-dd-yyyy');
        }
        if ($scope.tskD.SCH.SchScheduledEndTimeOnly == "N/A") {
            $scope.scheduleEndTime = convertToAmPm(new Date().getHours() + ":" + new Date().getMinutes());
        } else {
            $scope.scheduleEndTime = $scope.tskD.SCH.SchScheduledEndTimeOnly;
        }
        if ($scope.tskD.INF.InfoPriority == "1Escalated") {
            $scope.priority = 10001;

        }
        if ($scope.tskD.INF.InfoPriority == "2System Down") {
            $scope.priority = 10003;

        }
        if ($scope.tskD.INF.InfoPriority == "3Patient On Table") {
            $scope.priority = 10005;

        }
        if ($scope.tskD.INF.InfoPriority == "4High") {
            $scope.priority = 10007;

        }
        if ($scope.tskD.INF.InfoPriority == "5Medium") {
            $scope.priority = 10009;

        }
        if ($scope.tskD.INF.InfoPriority == "6Low") {
            $scope.priority = 10011;

        }
        if (!isNaN($scope.tskD.INF.InfoPriority.substr(0, 1))) {
            $scope.tskD.INF.InfoPriority = $scope.tskD.INF.InfoPriority.substr(1);
        }
        if ($scope.tskD.TSK.Status == "Waiting for test equipment") {
            $scope.status = 11011;

        }
        if ($scope.tskD.TSK.Status == "Waiting for parts") {
            $scope.status = 11007;

        }
        if ($scope.tskD.TSK.Status == "Working") {
            $scope.status = 5;

        }
        if ($scope.tskD.TSK.Status == "Waiting for PO") {
            $scope.status = 11005;

        }
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
            $scope.status = 11001;

        }

        if ($scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5)[4] != ":") {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
        } else {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
        }
        if ($location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "changeeta" && isIPhone()) {
            var inStartHTML = '';
            var inEndHTML = '';
            $scope.scheduleStartDate = $scope.scheduleStartDate.split('-')[2] + "-" + $scope.scheduleStartDate.split('-')[0] + "-" + $scope.scheduleStartDate.split('-')[1];
            var tempDate = $scope.scheduleStartDate.split("-");
            if (tempDate[1].length == 1) {
                tempDate[1] = "0" + tempDate[1];
            }
            if (tempDate[2].length == 1) {
                tempDate[2] = "0" + tempDate[2];
            }
            $scope.scheduleStartDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
            inStartHTML = '<input id="etaStartDate" type="date" ng-model="scheduleStartDate" class="form-control form-control-mdf" value="' + $scope.scheduleStartDate + '" /><span class="spn-tme-zne"> (' + $scope.tskD.SCH.SchTimeZone + ')</span>';
            $('#tdStartDate').html(inStartHTML);
            $scope.scheduleEndDate = $scope.scheduleEndDate.split('-')[2] + "-" + $scope.scheduleEndDate.split('-')[0] + "-" + $scope.scheduleEndDate.split('-')[1];
            var tempDate = $scope.scheduleEndDate.split("-");
            if (tempDate[1].length == 1) {
                tempDate[1] = "0" + tempDate[1];
            }
            if (tempDate[2].length == 1) {
                tempDate[2] = "0" + tempDate[2];
            }
            $scope.scheduleEndDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
            inEndHTML = '<input id="etaEndDate" type="date" ng-model="scheduleEndDate" class="form-control form-control-mdf" value="' + $scope.scheduleEndDate + '" /><span class="spn-tme-zne"> (' + $scope.tskD.SCH.SchTimeZone + ')</span>';
            $('#tdEndDate').html(inEndHTML);
        }
        $http({
            method: "GET",
            url: "api/Tasks/" + $scope.tskD.TSK.IncidentID + "/GetTaskNotes",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.tskD.taskNotes = data;
        })
        .error(function (data, status, headers, config) {

        });

        $http({
            method: "GET",
            url: "api/Tasks/" + $scope.tskD.TSK.IncidentID + "/GetCounter",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.tskD.CurrentCounter = data;
        })
        .error(function (data, status, headers, config) {

        });

        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId + "/GetManagerApproval",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            if (data != "\"null\"") {
                $scope.managerApprovalTemp = data.substr(data.indexOf("\"") + 1).substr(0, data.indexOf("\"") + 1);
                $scope.managerApproval = $scope.managerApprovalTemp;
            }
        })
        .error(function (data, status, headers, config) {

        });
        $scope.tamsDown = '';
        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId + "/GetSystemDown",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            if (data.sysDown != "null" && (data.sysDown == "1" || data.sysDown == "Yes")) {
                $scope.sysDown = "Yes";
            }
            if (data.sysAvailable != "null" && (data.sysAvailable == "1" || data.sysAvailable == "Yes")) {
                $scope.sysAvailable = "Yes";
            }
            if (data.cfmDown != "null") {
                $scope.cfmDown = data.cfmDown;
                $scope.tamsDown = $scope.cfmDown;
                $scope.confirmDownSet = true;
            } else {
                $scope.confirmDownSet = false;
            }
            if (data.sysUpDate != "" && data.sysUpDate != "0001-01-01T00:00:00") {
                $scope.systemUpDate = data.sysUpDate.toString().substr(0, data.sysUpDate.toString().indexOf("T")).split("-")[1] + "-" + data.sysUpDate.toString().substr(0, data.sysUpDate.toString().indexOf("T")).split("-")[2] + "-" + data.sysUpDate.toString().substr(0, data.sysUpDate.toString().indexOf("T")).split("-")[0];
                $scope.systemUpTime = convertToAmPm(data.sysUpDate.toString().substr(data.sysUpDate.toString().indexOf("T") + 1, 5));
            } else {
                $scope.systemUpDate = (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear();
                $scope.systemUpTime = convertToAmPm(new Date().getHours() + ":" + new Date().getMinutes());
            }
            if ($location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "tamsdown" && isIPhone()) {
                var tamsDateHTML = '';
                $scope.systemUpDate = $scope.systemUpDate.split('-')[2] + "-" + $scope.systemUpDate.split('-')[0] + "-" + $scope.systemUpDate.split('-')[1];
                var tempDate = $scope.systemUpDate.split("-");
                if (tempDate[1].length == 1) {
                    tempDate[1] = "0" + tempDate[1];
                }
                if (tempDate[2].length == 1) {
                    tempDate[2] = "0" + tempDate[2];
                }
                $scope.systemUpDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                tamsDateHTML = '<input id="tamsDownDate" type="date" ng-model="systemUpDate" class="form-control form-control-mdf" value="' + $scope.systemUpDate + '" /><span class="spn-tme-zne"> (' + $scope.tskD.SCH.SchTimeZone + ')</span>';
                $('#tdSystemUpDate').html(tamsDateHTML);
            }
        })
        .error(function (data, status, headers, config) {

        });

        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId + "/GetFaxEmail",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            if (data.ItemArray[0] !== undefined || data.ItemArray[0] != "") {
                $scope.attention = data.ItemArray[0];
            }
            if (data.ItemArray[1] !== undefined || data.ItemArray[1] != "") {
                $scope.fax = data.ItemArray[1];
            }
            if (data.ItemArray[2] !== undefined || data.ItemArray[2] != "") {
                $scope.email = data.ItemArray[2];
            }
            if (data.ItemArray[3] !== undefined || data.ItemArray[3] != "") {
                $scope.email += ", " + data.ItemArray[3];
            }
            if (data.ItemArray[4] !== undefined || data.ItemArray[4] != "") {
                $scope.department = data.ItemArray[4];
            }
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
        });
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            TaskStoreID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
            localStorage.setItem("fsaSessionObject", "");
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }

    $scope.currentDiv = 1;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }
    $scope.listPrice = 'NO';
    $scope.updateFaxEmail = function () {
        if ($scope.listPrice === undefined || $scope.listPrice == "") {
            $('#upFxElErrMain').html('Please select list price.');
            showTimedElem('upFxElErrMain');
            return;
        }

        //if ($scope.fax == "" || $scope.fax == null) {
        //    $('#upFxElErrMain').html('Please enter a fax number.');
        //    showTimedElem('upFxElErrMain');
        //    return;
        //}

        //if (!isValidPhoneNumber($scope.fax)) {
        //    $('#upFxElErrMain').html('Please enter valid fax number in format XXX-XXX-XXXX.');
        //    showTimedElem('upFxElErrMain');
        //    return;
        //}

        //var count = $scope.email.match(/,/g);
        //if (count.length > 1) {
        //    $('#upFxElErrMain').html('Only two emails are allowed.');
        //    showTimedElem('upFxElErrMain');
        //    return;
        //}

        showLoading(true);
        var faxEmailClass = {
            taskId: $routeParams.taskId,
            fax: $scope.fax,
            email: $scope.email,
            attention: $scope.attention,
            department: $scope.department,
            listPrice: $scope.listPrice
        };
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/updateFaxEmail",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(faxEmailClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chFxElMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#upFxElErrMain").html("Error: " + data.ExceptionMessage);
                showTimedElem('upFxElErrMain');
            }
        });
    }

    $scope.changeStatus = function () {
        if ($scope.status === undefined) {
            $('#stsErrMain').html("Please select a status.");
            showTimedElem('stsErrMain');
            return;
        }
        showLoading(true);
        var fdaComplete = false;
        if ($scope.status == 11001) {
            if (!$scope.confirmDownSet && $scope.sysDown == "Yes") {
                $('#changeStatus').hide();
                $('#tamsDown').show();
                showLoading(false);
            } else {
                $http({
                    method: "GET",
                    url: "api/Tasks/" + $routeParams.taskId + "/GetFDAQuestions",
                    contentType: "application/json; charset=utf-8",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //display successfull message;
                    if (data[0] == "" || data[1] == "" || data[2] == "" || data[3] == "" || data[4] == "") {
                        $location.path("/tasks/" + $routeParams.taskId + "/fdaQuestions/11001");
                    } else {
                        var statusClass = {
                            status: $scope.status,
                            taskID: $routeParams.taskId
                        }
                        showLoading(true);
                        $http({
                            method: "POST",
                            url: "api/Tasks/" + $routeParams.taskId + "/ChangeStatus",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(statusClass),
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            //display successfull message;
                            showLoading(false);
                            $location.path("/tasks");
                        })
                        .error(function (data, status, headers, config) {
                            showLoading(false);
                            if (status == 401) {
                                $location.path("/login");
                            }
                            else {
                                //display error in a label
                                $('#stsErrMain').html("Error: " + data.ExceptionMessage);
                                showTimedElem('stsErrMain');
                            }
                        });
                    }
                })
                .error(function (data, status, headers, config) {
                    $location.path("/tasks/" + $routeParams.taskId + "/fdaQuestions/11001");
                    return;
                });
            }
        } else {
            var statusClass = {
                status: $scope.status,
                taskID: $routeParams.taskId
            }
            showLoading(true);
            $http({
                method: "POST",
                url: "api/Tasks/" + $routeParams.taskId + "/ChangeStatus",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(statusClass),
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                //display successfull message;
                showLoading(false);
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#stsErrMain').html("Error: " + data.ExceptionMessage);
                    showTimedElem('stsErrMain');
                }
            });
        }
    }
    $scope.changePriority = function () {
        if ($scope.priority === undefined) {
            $('#prtyErrMain').html("Please select a priority");
            showTimedElem('prtyErrMain');
            return;
        }
        var priorityClass = {
            priority: $scope.priority,
            taskID: $routeParams.taskId
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/ChangePriority",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(priorityClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chPriorityMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#prtyErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('prtyErrMain');
            }
        });
    }

    $scope.enterPO = function () {

        var poClass = {
            po: $scope.po,
            taskID: $scope.tskD.TSK.ID
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/ChangePO",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(poClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chPOMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else if (status == 409) {
                $('#poErrMain').html("Record locked. Please try again later.");
                showTimedElem('poErrMain');
            }
            else {
                //display error in a label
                $('#poErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('poErrMain');
            }
        });
    }

    $scope.changeCounter = function () {
        if ($scope.nextCounter === undefined || $scope.nextCounter == "" || $scope.nextCounter <= 0) {
            $('#chCtrErrMain').html('Please enter a valid counter.');
            showTimedElem('chCtrErrMain');
            return;
        }

        if ($scope.nextCounter <= parseInt($scope.tskD.CurrentCounter)) {
            $('#chCtrErrMain').html('Counter must be greater than current Reading.');
            showTimedElem('chCtrErrMain');
            return;
        }

        if ($scope.nextCounter >= (parseInt($scope.tskD.CurrentCounter) + 1000000)) {
            $('#chCtrErrMain').html('Please enter a counter < current counter + 1000000.');
            showTimedElem('chCtrErrMain');
            return;
        }
        var counterClass = {
            counter: $scope.nextCounter,
            srNum: $scope.tskD.TSK.IncidentID
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/ChangeCounter",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(counterClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chCounterMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            } else {
                //display error in a label
                $('#chCtrErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('chCtrErrMain');
            }
        });
    }

    $scope.changeEta = function () {
        if (isIPhone()) {
            if ($('#etaStartDate').val() != "") {
                $scope.scheduleStartDate = $('#etaStartDate').val().split('-')[1] + "-" + $('#etaStartDate').val().split('-')[2] + "-" + $('#etaStartDate').val().split('-')[0];
            } else {
                $('#chEtaErrMain').html('Please enter a valid date and/or time.');
                showTimedElem('chEtaErrMain');
                return;
            }
            if ($('#etaEndDate').val() != "") {
                $scope.scheduleEndDate = $('#etaEndDate').val().split('-')[1] + "-" + $('#etaEndDate').val().split('-')[2] + "-" + $('#etaEndDate').val().split('-')[0];
            } else {
                $('#chEtaErrMain').html('Please enter a valid date and/or time.');
                showTimedElem('chEtaErrMain');
                return;
            }
        } else {
            $scope.scheduleStartDate = $('#schStDt').val();
            $scope.scheduleEndDate = $('#schEnDt').val();
        }

        if ($scope.scheduleStartDate === undefined || $scope.scheduleStartDate == "" || $scope.scheduleStartTime === undefined || $scope.scheduleStartTime == "" || $scope.scheduleEndDate === undefined || $scope.scheduleEndDate == "" || $scope.scheduleEndTime === undefined || $scope.scheduleEndTime == "") {
            $('#chEtaErrMain').html('Please enter a valid date and/or time.');
            showTimedElem('chEtaErrMain');
            return;
        }
        var stDate = "";
        if ($scope.scheduleStartDate.toString().indexOf("-") > 0 && $scope.scheduleStartDate.toString().indexOf("GMT") == -1) {
            stDate = new Date($scope.scheduleStartDate.toString().replace("-", "/").replace("-", "/") + " " + $scope.scheduleStartTime.replace(" ", ":00 "));
        } else {
            stDate = new Date($scope.scheduleStartDate.toString().replace($scope.scheduleStartDate.toString().substr($scope.scheduleStartDate.toString().indexOf(":00 ") - 5, 8), convertTo24HrFormat($scope.scheduleStartTime) + ":00"));
        }
        var enDate = "";
        if ($scope.scheduleEndDate.toString().indexOf("-") > 0 && $scope.scheduleEndDate.toString().indexOf("GMT") == -1) {
            var enDate = new Date($scope.scheduleEndDate.toString().replace("-", "/").replace("-", "/") + " " + $scope.scheduleEndTime.replace(" ", ":00 "));
        } else {
            enDate = new Date($scope.scheduleEndDate.toString().replace($scope.scheduleEndDate.toString().substr($scope.scheduleEndDate.toString().indexOf(":00 ") - 5, 8), convertTo24HrFormat($scope.scheduleEndTime) + ":00"));
        }

        var incidentDate = new Date($scope.tskD.TSK.SiteIncidentDate);
        incidentDate = new Date(incidentDate.getFullYear(), incidentDate.getMonth(), incidentDate.getDate(), incidentDate.getHours(), incidentDate.getMinutes(), 0);

        //  if (new Date($scope.tskD.TSK.IncidentDate) > stDate) {
        if (incidentDate > stDate) {
            $('#chEtaErrMain').html('Start date and time should be greater than or equal to Service Request incident date and time.');
            showTimedElem('chEtaErrMain');
            return;
        }

        if (stDate >= enDate) {
            $('#chEtaErrMain').html('Start date cannot be greater than or equal to end date.');
            showTimedElem('chEtaErrMain');
            return;
        }

        var etaClass = {
            taskID: $routeParams.taskId,
            sDate: $scope.scheduleStartDate,
            sTime: $scope.scheduleStartTime,
            eDate: $scope.scheduleEndDate,
            eTime: $scope.scheduleEndTime,
            timeZone: $scope.tskD.SCH.SchTimeZone
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/ChangeEta",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(etaClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chETAMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            } else {
                //display error in a label
                $('#chEtaErrMain').html("Error : " + data.ExceptionMessage);
                showTimedElem('chEtaErrMain');
            }
        });
    }

    $scope.updateManagerApproval = function () {
        if ($scope.managerApproval === undefined || $scope.managerApproval == "") {
            $('#mgrAppErrMain').html("Please select Yes or No.");
            showTimedElem('mgrAppErrMain');
            return;
        }

        var mgrAppClass = {
            taskID: $routeParams.taskId,
            approval: $scope.managerApproval
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/updateManagerApproval",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(mgrAppClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chMgrAppMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            } else {
                //display error in a label
                $('#mgrAppErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('mgrAppErrMain');
            }
        });
    }

    $scope.updateTamsDown = function (fromStatus) {
        if (isIPhone()) {
            if ($('#tamsDownDate').val() != "") {
                $scope.systemUpDate = $('#tamsDownDate').val().split('-')[1] + "-" + $('#tamsDownDate').val().split('-')[2] + "-" + $('#tamsDownDate').val().split('-')[0];
            } else {
                $('#tdDwnErrMain').html('Date cannot be empty.');
                showTimedElem('tdDwnErrMain');
                return;
            }
        }
        if ($scope.tamsDown === undefined || $scope.tamsDown == "") {
            $('#tdDwnErrMain').html('Please select Yes or No.');
            showTimedElem('tdDwnErrMain');
            return;
        }

        if ($scope.sysDown == "Yes" && $scope.tamsDown == "Yes") {
            if (($scope.systemUpDate == null || $scope.systemUpDate === undefined || $scope.systemUpDate == "") || ($scope.systemUpTime == null || $scope.systemUpTime === undefined || $scope.systemUpTime == "")) {
                $('#tdDwnErrMain').html('Date and time cannot be empty.');
                showTimedElem('tdDwnErrMain');
                return;
            }
        }

        var tamsDwnClass = {
            taskID: $routeParams.taskId,
            down: $scope.tamsDown,
            upDate: $scope.systemUpDate,
            upTime: $scope.systemUpTime
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/updateTamsDown",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(tamsDwnClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (fromStatus) {
                $scope.confirmDownSet = true;
                $scope.changeStatus();
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chTmDwnMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            } else {
                //display error in a label
                $('#tdDwnErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('tdDwnErrMain');
            }
        });
    }
}
TaskDetailController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('TaskDetailController', TaskDetailController);

function TaskDetailMenuController($rootScope, $scope, $routeParams, $http, $location) {
    disableToolTip();
    showAnchorLogo(false);
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId + "/GetSystemDown",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            if (data.srType.toString == "11002") {
                if (data.sysDown != "null" && data.sysDown == "1") {        //confirm down should be required only when system is DOWN and SR type is General Repair
                    if (data.cfmDown == 'Yes' || data.cfmDown == 'No') {
                        $scope.lbrDbrf = 1;
                    }
                    else {
                        $scope.lbrDbrf = 0;
                    }
                } else {
                    $scope.lbrDbrf = 1;
                }
            } else {
                $scope.lbrDbrf = 1;
            }
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            $scope.lbrDbrf = 1;     //0; setting lbrDbrf flag to 1 because error means there is no system down specified for the task
        });
        $scope.tskD = data;
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        $location.path("/tasks/rtnTsk/rtvTskDetMsg");
    });
    $scope.taskId = $routeParams.taskId;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "' ><img src='images/Three-Dots.png' height='28px' /></a>");
}

TaskDetailMenuController.$inject = ['$rootScope', '$scope', '$routeParams', '$http', '$location'];
fsaModule.controller('TaskDetailMenuController', TaskDetailMenuController);

function NotesController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }

    if ($routeParams.ntsRtnMsg !== undefined) {
        if ($routeParams.ntsRtnMsg == "adNtsMsg") {
            $('#nteSusMsg').html("Note added succesfully");
            showTimedElem('nteSusMsg');
        }
    }

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
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
            $location.path("/tasks/" + $routeParams.taskId);
        }
        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId + "/Notes",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            showLoading(false);
            $scope.notes = data;
            $scope.showNotesCount = 0;
            if ($scope.notes.length > 0) {
                $scope.showNotesCount = 1;
            }
            for (var i = 0; i < $scope.notes.length; i++) {
                if ($filter('date')(new Date($scope.notes[i].DATE), 'MM-dd-yyyy').toString().split('-')[1] == $filter('date')(new Date(), 'MM-dd-yyyy').toString().split('-')[1]) {
                    $scope.notes[i].sup = 1;
                }
                $scope.notes[i].NOTE = $scope.notes[i].NOTE.replace(/\n\r?/g, '<br />');
                $scope.notes[i].Note2 = deprecateNote($scope.notes[i].NOTE, $routeParams.taskId, i, $scope.notes[i].ID);
                if ($scope.notes[i].NOTE.length > 130) {
                    $scope.notes[i].NOTE += " <a href='#/tasks/" + $routeParams.taskId + "/notes' onclick='readMoreToggle(" + $scope.notes[i].ID + ")'>less...</a>";
                }
                $scope.notes[i].showMore = 0;
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#nteErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('nteErrMain');
            }
        });
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if ((status == 401) || (status == 0)) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }

        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }
}
NotesController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('NotesController', NotesController);

function AddUpdateNotesController($rootScope, $scope, $location, $routeParams, $http) {
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();
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
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
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
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.addNote = function () {
        if ($scope.noteType === undefined || $scope.noteType.replace(/\s+/g, ' ') == "") {
            $('#addNteErrMain').html('Note type cannnot be empty.');
            showTimedElem('addNteErrMain');
            return;
        }
        if ($scope.noteNotes === undefined || $scope.noteNotes.replace(/\s+/g, ' ') == "") {
            $('#addNteErrMain').html('Note description cannnot be empty.');
            showTimedElem('addNteErrMain');
            return;
        }
        var note = {
            NoteType: $scope.noteType,
            Notes: $scope.noteNotes//.replace(/\n\r?/g, '<br />')
        }

        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Note",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -1) {
                $('#addNteErrMain').html('Note cannot be added. Please try again later.');
                showTimedElem('addNteErrMain');
            }
            else {
                $location.path("/tasks/" + $routeParams.taskId + "/notes/rtnNte/adNtsMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#addNteErrMain').html("Error in adding note: " + data.ExceptionMessage);
                showTimedElem('addNteErrMain');
            }
        });
    }

    $scope.BackToNotes = function () {
        $location.path('/tasks/' + $routeParams.taskId + '/notes');
    }

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }

        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }
}
AddUpdateNotesController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http'];
fsaModule.controller('AddUpdateNotesController', AddUpdateNotesController);

function LaborsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");

    if ($routeParams.lbrRtnMsg !== undefined) {
        if ($routeParams.lbrRtnMsg == "adLbrMsg") {
            $('#lbrMsg').html("Labor successfully added");
            showTimedElem("lbrMsg");
        }
        if ($routeParams.lbrRtnMsg == "udLbrMsg") {
            $('#lbrMsg').html("Labor successfully updated");
            showTimedElem("lbrMsg");
        }
        if ($routeParams.lbrRtnMsg == "dlLbrMsg") {
            $('#lbrMsg').html("Labor successfully deleted");
            showTimedElem("lbrMsg");
        }
    }
    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }

    $scope.showAddLabor = function () {
        $location.path("/tasks/" + $routeParams.taskId + "/labor");
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
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
    })
    .error(function (data, status, headers, config) {
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    showLoading(true);
    $http({
        method: "GET",
        url: "api/Labors/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.noOfLabors = 0;
        $scope.labors = data;
        $rootScope.savedLabors = data;
        for (var lbr in $scope.labors) {
            $scope.noOfLabors++;
            $scope.labors[lbr].StartDate = $filter('date')(new Date($scope.labors[lbr].StartDate), 'MM-dd-yyyy hh:mm a');
            if ($scope.labors[lbr].Duration.indexOf('.') > 0) {
                if ($scope.labors[lbr].Duration.split('.')[1].length == 1) {
                    $scope.labors[lbr].Duration += '0';
                }
            } else {
                $scope.labors[lbr].Duration += '.00';
            }
            $scope.labors[lbr].Duration += " HR";
        }
        setTimeout($scope.RefreshLabors, 5000);
        showLoading(false);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            fsaApp.session.removeSessionValue();
            $location.path("/login");
        }
        else {
            //display error in a label
            //$('#lbrErr').html("Error in retrieving Labors: " + data.ExceptionMessag);
            //showTimedElem('lbrErr');
        }
    });

    $scope.RefreshLabors = function () {
        //showLoading(true);
        //$('.refreshLaborImageClass').show();
        //$('.syncStatusClass').hide();
        $http({
            method: "GET",
            url: "api/Labors/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.noOfLabors = 0;
            $scope.labors = data;
            $rootScope.savedLabors = data;
            for (var lbr in $scope.labors) {
                $scope.noOfLabors++;
                $scope.labors[lbr].StartDate = $filter('date')(new Date($scope.labors[lbr].StartDate), 'MM-dd-yyyy hh:mm a');
                if ($scope.labors[lbr].Duration.indexOf('.') > 0) {
                    if ($scope.labors[lbr].Duration.split('.')[1].length == 1) {
                        $scope.labors[lbr].Duration += '0';
                    }
                } else {
                    $scope.labors[lbr].Duration += '.00';
                }
                $scope.labors[lbr].Duration += " HR";
            }
            //showLoading(false);
            //$('.syncStatusClass').show();
            //$('.refreshLaborImageClass').hide();
            setTimeout($scope.RefreshLabors, 5000);
        })
        .error(function (data, status, headers, config) {
            setTimeout($scope.RefreshLabors, 5000);
        });
    }

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }

        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }
}
LaborsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('LaborsController', LaborsController);

function AddUpdateLaborsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    $scope.parentID = 0;
    $.fn.timepicker.defaults = {
        defaultTime: 'current',
        disableFocus: false,
        isOpen: false,
        minuteStep: 15,
        modalBackdrop: false,
        secondStep: 15,
        showSeconds: false,
        showInputs: false,
        showMeridian: true,
        template: 'dropdown',
        appendWidgetTo: '.bootstrap-timepicker'
    };
    var selectedLabor = "";
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");
    $scope.laborDebriefID = '';
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
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.InstanceID != "") {
            $scope.subComponent = $scope.tskD.TSK.InstanceID;
        } else {
            $scope.subComponent = $scope.tskD.TSK.SystemID;
        }
        $scope.subComponentName = $scope.tskD.TSK.InstanceDescription;
        $scope.productName = $scope.tskD.TSK.ProductName;

        if ($scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5)[4] != ":") {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
        } else {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];

        }
        $scope.isUpdateScreen = "";
        $http({
            method: "GET",
            url: "api/Labors/" + $scope.tskD.TSK.SRTypeID + "/GetServiceReasons",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.reasonOptions = data;
            if ($routeParams.laborId !== undefined && $routeParams.laborId != "") {
                $scope.isUpdateScreen = $routeParams.laborId;
                $scope.parentID = 0;
                if ($rootScope.savedLabors !== undefined && $rootScope.savedLabors != "") {
                    for (var i = 0; i < $rootScope.savedLabors.length; i++) {
                        if ($rootScope.savedLabors[i].SqlID == "") {
                            if ($routeParams.laborId == $rootScope.savedLabors[i].DebriefLineID) {
                                selectedLabor = $rootScope.savedLabors[i];
                                break;
                            }
                        } else {
                            if ($routeParams.laborId == $rootScope.savedLabors[i].SqlID) {
                                selectedLabor = $rootScope.savedLabors[i];
                                break;
                            }
                        }
                    }
                    $scope.startDate = selectedLabor.StartDate.split(" ")[0].replace("/", "-").replace("/", "-");
                    var tempDate = $scope.startDate.split("-");
                    if (tempDate[0].length == 1) {
                        tempDate[0] = "0" + tempDate[0];
                    }
                    if (tempDate[1].length == 1) {
                        tempDate[1] = "0" + tempDate[1];
                    }
                    $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                    $("#lbrStDt").val($scope.startDate);
                    $scope.startTime = selectedLabor.StartDate.split(" ")[1].substr(0, 5) + " " + selectedLabor.StartDate.split(" ")[2];
                    if ($scope.startTime[4] == ":") {
                        $scope.startTime = "0" + $scope.startTime.substr(0, 4) + " " + selectedLabor.StartDate.split(" ")[2];
                    }
                    $("#lbrStTm").val($scope.startTime);
                    $scope.reason = selectedLabor.LaborReasonMeaning;
                    var durationTemp = selectedLabor.Duration.split(" ")[0];
                    if (durationTemp.indexOf(".") > 0) {
                        $scope.hours = durationTemp.split(".")[0];
                        if (parseInt(durationTemp.split(".")[1]) == 98) {
                            $scope.minutes = "59";
                        } else {
                            var minsTemp = (parseInt(durationTemp.split(".")[1]) / 100) * 60;
                            if (minsTemp % 15 != 0) {
                                $scope.minutes = minsTemp - (minsTemp % 15);
                            } else {
                                $scope.minutes = minsTemp;
                            }
                        }
                    } else {
                        $scope.hours = durationTemp;
                        $scope.minutes = "00";
                    }
                    if ($scope.minutes == 0) {
                        $scope.minutes = "00";
                    }
                    $scope.laborDebriefID = selectedLabor.DebriefLineID;
                    if (selectedLabor.ParentID != "") {
                        $scope.parentID = selectedLabor.ParentID;
                    } else {
                        if (selectedLabor.SqlID != "") {
                            $scope.parentID = selectedLabor.SqlID;
                        }
                    }
                    if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {
                        if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                            $http({
                                method: "GET",
                                url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetProductItems",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                headers: fsaApp.session.getAuthenticationHeader()
                            })
                            .success(function (data, status, headers, config) {
                                $scope.prdItemsActual = data;
                                $scope.prdItemsActual.forEach(function (node) {
                                    if (selectedLabor.SubComponent == node.instanceID) {
                                        $scope.subComponent = selectedLabor.SubComponent;
                                        $scope.subComponentName = node.description;
                                    }
                                });
                                $scope.syncStatus = selectedLabor.SynchStatus;
                                $scope.syncError = selectedLabor.Error;
                                if (isIPhone()) {
                                    var lbrDateHTML = '';
                                    $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                    var tempDate = $scope.startDate.split('-');
                                    if (tempDate[1].length == 1) {
                                        tempDate[1] = "0" + tempDate[1];
                                    }
                                    if (tempDate[2].length == 1) {
                                        tempDate[2] = "0" + tempDate[2];
                                    }
                                    $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                    lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                    $('#tdLbrStartDate').html(lbrDateHTML);
                                    $("#lbrStartDate").blur(function () {
                                        var scope = angular.element($("#div-product-items")).scope();
                                        if (scope.hours === undefined || scope.hours == "") {
                                            scope.hours = 0;
                                        }
                                        if (scope.minutes === undefined) {
                                            scope.minutes = '00';
                                        }
                                        scope.$apply(scope.updLbrTms());
                                    });
                                }
                                $scope.updLbrTms();
                                showLoading(false);
                            })
                            .error(function (data, status, headers, config) {
                                showLoading(false);
                                if (status == 401) {
                                    $location.path("/login");
                                }
                                else {
                                    //display error in a label
                                    $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                                    showTimedElem('addLbrErrMain');
                                }
                            });
                        } else {
                            $scope.prdItemsActual.foreach(function (node) {
                                if (selectedLabor.SubComponent == node.instanceID) {
                                    $scope.subComponent = selectedLabor.SubComponent;
                                    $scope.subComponentName = node.description;
                                }
                            });
                            $scope.syncStatus = selectedLabor.SynchStatus;
                            $scope.syncError = selectedLabor.Error;
                            if (isIPhone()) {
                                var lbrDateHTML = '';
                                $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                var tempDate = $scope.startDate.split('-');
                                if (tempDate[1].length == 1) {
                                    tempDate[1] = "0" + tempDate[1];
                                }
                                if (tempDate[2].length == 1) {
                                    tempDate[2] = "0" + tempDate[2];
                                }
                                $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                $('#tdLbrStartDate').html(lbrDateHTML);
                                $("#lbrStartDate").blur(function () {
                                    var scope = angular.element($("#div-product-items")).scope();
                                    if (scope.hours === undefined || scope.hours == "") {
                                        scope.hours = 0;
                                    }
                                    if (scope.minutes === undefined) {
                                        scope.minutes = '00';
                                    }
                                    scope.$apply(scope.updLbrTms());
                                });
                            }
                            $scope.updLbrTms();
                            showLoading(false);
                        }
                    } else {
                        $http({
                            method: "GET",
                            url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetSubcomponentName",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            $scope.productName = data.replace('"', '').replace('"', '');
                            $scope.syncStatus = selectedLabor.SynchStatus;
                            $scope.syncError = selectedLabor.Error;
                            if (isIPhone()) {
                                var lbrDateHTML = '';
                                $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                var tempDate = $scope.startDate.split('-');
                                if (tempDate[1].length == 1) {
                                    tempDate[1] = "0" + tempDate[1];
                                }
                                if (tempDate[2].length == 1) {
                                    tempDate[2] = "0" + tempDate[2];
                                }
                                $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                $('#tdLbrStartDate').html(lbrDateHTML);
                                $("#lbrStartDate").blur(function () {
                                    var scope = angular.element($("#div-product-items")).scope();
                                    if (scope.hours === undefined || scope.hours == "") {
                                        scope.hours = 0;
                                    }
                                    if (scope.minutes === undefined) {
                                        scope.minutes = '00';
                                    }
                                    scope.$apply(scope.updLbrTms());
                                });
                            }
                            $scope.updLbrTms();
                            showLoading(false);
                        })
                        .error(function (data, status, headers, config) {
                            showLoading(false);
                            if (status == 401) {
                                $location.path("/login");
                            }
                            else {
                                //display error in a label
                                $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                                showTimedElem('addLbrErrMain');
                            }
                        });
                    }

                } else {
                    $http({
                        method: "GET",
                        url: "api/Labors/" + $routeParams.taskId,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: fsaApp.session.getAuthenticationHeader()
                    })
                    .success(function (data, status, headers, config) {
                        $scope.noOfLabors = 0;
                        $scope.labors = data;
                        for (var i = 0; i < $scope.labors.length; i++) {
                            if ($scope.labors[i].SqlID == "") {
                                if ($routeParams.laborId == $scope.labors[i].DebriefLineID) {
                                    selectedLabor = $scope.labors[i];
                                    break;
                                }
                            } else {
                                if ($routeParams.laborId == $scope.labors[i].SqlID) {
                                    selectedLabor = $scope.labors[i];
                                    break;
                                }
                            }
                        }
                        $scope.startDate = selectedLabor.StartDate.split(" ")[0].replace("/", "-").replace("/", "-");
                        var tempDate = $scope.startDate.split("-");
                        if (tempDate[0].length == 1) {
                            tempDate[0] = "0" + tempDate[0];
                        }
                        if (tempDate[1].length == 1) {
                            tempDate[1] = "0" + tempDate[1];
                        }
                        $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];

                        $("#lbrStDt").val($scope.startDate);
                        $scope.startTime = selectedLabor.StartDate.split(" ")[1].substr(0, 5) + " " + selectedLabor.StartDate.split(" ")[2];
                        if ($scope.startTime[4] == ":") {
                            $scope.startTime = "0" + $scope.startTime.substr(0, 4) + " " + selectedLabor.StartDate.split(" ")[2];
                        }
                        $("#lbrStTm").val($scope.startTime);
                        $scope.reason = selectedLabor.LaborReasonMeaning;
                        var durationTemp = selectedLabor.Duration.split(" ")[0];
                        if (durationTemp.indexOf(".") > 0) {
                            $scope.hours = durationTemp.split(".")[0];
                            if (parseInt(durationTemp.split(".")[1]) == 98) {
                                $scope.minutes = "59";
                            } else {
                                var minsTemp = (parseInt(durationTemp.split(".")[1]) / 100) * 60;
                                if (minsTemp % 15 != 0) {
                                    $scope.minutes = minsTemp - (minsTemp % 15);
                                } else {
                                    $scope.minutes = minsTemp;
                                }
                            }
                        } else {
                            $scope.hours = durationTemp;
                            $scope.minutes = "00";
                        }
                        if ($scope.minutes == 0) {
                            $scope.minutes = "00";
                        }
                        $scope.laborDebriefID = selectedLabor.DebriefLineID;
                        if (selectedLabor.ParentID != "") {
                            $scope.parentID = selectedLabor.ParentID;
                        } else {
                            if (selectedLabor.SqlID != "") {
                                $scope.parentID = selectedLabor.SqlID;
                            }
                        }
                        if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {
                            if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                                $http({
                                    method: "GET",
                                    url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetProductItems",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    headers: fsaApp.session.getAuthenticationHeader()
                                })
                                .success(function (data, status, headers, config) {
                                    $scope.prdItemsActual = data;
                                    $scope.prdItemsActual.forEach(function (node) {
                                        if (selectedLabor.SubComponent == node.instanceID) {
                                            $scope.subComponent = selectedLabor.SubComponent;
                                            $scope.subComponentName = node.description;
                                        }
                                    });
                                    $scope.syncStatus = selectedLabor.SynchStatus;
                                    $scope.syncError = selectedLabor.Error;
                                    if (isIPhone()) {
                                        var lbrDateHTML = '';
                                        $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                        var tempDate = $scope.startDate.split('-');
                                        if (tempDate[1].length == 1) {
                                            tempDate[1] = "0" + tempDate[1];
                                        }
                                        if (tempDate[2].length == 1) {
                                            tempDate[2] = "0" + tempDate[2];
                                        }
                                        $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                        lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                        $('#tdLbrStartDate').html(lbrDateHTML);
                                        $("#lbrStartDate").blur(function () {
                                            var scope = angular.element($("#div-product-items")).scope();
                                            if (scope.hours === undefined || scope.hours == "") {
                                                scope.hours = 0;
                                            }
                                            if (scope.minutes === undefined) {
                                                scope.minutes = '00';
                                            }
                                            scope.$apply(scope.updLbrTms());
                                        });
                                    }
                                    $scope.updLbrTms();
                                    showLoading(false);
                                })
                                .error(function (data, status, headers, config) {
                                    showLoading(false);
                                    if (status == 401) {
                                        $location.path("/login");
                                    }
                                    else {
                                        //display error in a label
                                        $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                                        showTimedElem('addLbrErrMain');
                                    }
                                });
                            } else {
                                $scope.prdItemsActual.foreach(function (node) {
                                    if (selectedLabor.SubComponent == node.instanceID) {
                                        $scope.subComponent = selectedLabor.SubComponent;
                                        $scope.subComponentName = node.description;
                                    }
                                });
                                $scope.syncStatus = selectedLabor.SynchStatus;
                                $scope.syncError = selectedLabor.Error;
                                if (isIPhone()) {
                                    var lbrDateHTML = '';
                                    $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                    var tempDate = $scope.startDate.split('-');
                                    if (tempDate[1].length == 1) {
                                        tempDate[1] = "0" + tempDate[1];
                                    }
                                    if (tempDate[2].length == 1) {
                                        tempDate[2] = "0" + tempDate[2];
                                    }
                                    $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                    lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                    $('#tdLbrStartDate').html(lbrDateHTML);
                                    $("#lbrStartDate").blur(function () {
                                        var scope = angular.element($("#div-product-items")).scope();
                                        if (scope.hours === undefined || scope.hours == "") {
                                            scope.hours = 0;
                                        }
                                        if (scope.minutes === undefined) {
                                            scope.minutes = '00';
                                        }
                                        scope.$apply(scope.updLbrTms());
                                    });
                                }
                                $scope.updLbrTms();
                                showLoading(false);
                            }
                        } else {
                            $http({
                                method: "GET",
                                url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetSubcomponentName",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                headers: fsaApp.session.getAuthenticationHeader()
                            })
                            .success(function (data, status, headers, config) {
                                $scope.productName = data.replace('"', '').replace('"', '');
                                $scope.syncStatus = selectedLabor.SynchStatus;
                                $scope.syncError = selectedLabor.Error;
                                if (isIPhone()) {
                                    var lbrDateHTML = '';
                                    $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
                                    var tempDate = $scope.startDate.split('-');
                                    if (tempDate[1].length == 1) {
                                        tempDate[1] = "0" + tempDate[1];
                                    }
                                    if (tempDate[2].length == 1) {
                                        tempDate[2] = "0" + tempDate[2];
                                    }
                                    $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
                                    lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
                                    $('#tdLbrStartDate').html(lbrDateHTML);
                                    $("#lbrStartDate").blur(function () {
                                        var scope = angular.element($("#div-product-items")).scope();
                                        if (scope.hours === undefined || scope.hours == "") {
                                            scope.hours = 0;
                                        }
                                        if (scope.minutes === undefined) {
                                            scope.minutes = '00';
                                        }
                                        scope.$apply(scope.updLbrTms());
                                    });
                                }
                                $scope.updLbrTms();
                                showLoading(false);
                            })
                            .error(function (data, status, headers, config) {
                                showLoading(false);
                                if (status == 401) {
                                    $location.path("/login");
                                }
                                else {
                                    //display error in a label
                                    $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                                    showTimedElem('addLbrErrMain');
                                }
                            });
                        }
                    })
                    .error(function (data, status, headers, config) {
                        showLoading(false);
                        if (status == 401) {
                            fsaApp.session.removeSessionValue();
                            $location.path("/login");
                        }
                        else {
                            //display error in a label
                            //$('#lbrErr').html("Error in retrieving Labors: " + data.ExceptionMessag);
                            //showTimedElem('lbrErr');
                        }
                    });
                }
            } else {
                showLoading(false);
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('addLbrErrMain');
            }
        });
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    if ($routeParams.laborStartDate === undefined) {
        $scope.startDate = (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear();
    } else {
        $scope.startDate = $routeParams.laborStartDate;
    }

    if ($routeParams.laborStartTime === undefined) {
        $scope.startTime = ($filter('date')(new Date(), 'hh:mm a')).toString();
    } else {
        $scope.startTime = $routeParams.laborStartTime;
    }
    if ($location.path().substr($location.path().lastIndexOf("/") + 1).toLowerCase() == "labor" && isIPhone()) {
        var lbrDateHTML = '';
        $scope.startDate = $scope.startDate.split('-')[2] + "-" + $scope.startDate.split('-')[0] + "-" + $scope.startDate.split('-')[1];
        var tempDate = $scope.startDate.split('-');
        if (tempDate[1].length == 1) {
            tempDate[1] = "0" + tempDate[1];
        }
        if (tempDate[2].length == 1) {
            tempDate[2] = "0" + tempDate[2];
        }
        $scope.startDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
        lbrDateHTML = '<input id="lbrStartDate" type="date" ng-model="startDate" class="form-control form-control-mdf" value="' + $scope.startDate + '" />';
        $('#tdLbrStartDate').html(lbrDateHTML);
        $('#lbrStartDate').blur(function () {
            var scope = angular.element($("#div-product-items")).scope();
            if (scope.hours === undefined || scope.hours == "") {
                scope.hours = 0;
            }
            if (scope.minutes === undefined) {
                scope.minutes = '00';
            }
            scope.$apply(scope.updLbrTms());
        });
    }
    $scope.recursedItems = false;
    $scope.showPrdItms = function () {
        showLoading(true);
        if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
            $http({
                method: "GET",
                url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetProductItems",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                showLoading(false);
                $scope.prdItemsActual = data;
                var dataMap = {};
                $scope.prdItemsActual.forEach(function (node) {
                    dataMap[node.instanceID] = node;
                });
                var tree = [];
                $scope.prdItemsActual.forEach(function (node) {
                    // find parent
                    var parent = dataMap[node.parentInstanceID];
                    if (parent) {
                        // create child array if it doesn't exist
                        (parent.children || (parent.children = []))
                            // add node to parent's child array
                            .push(node);
                    } else {
                        // parent is null or missing
                        tree.push(node);
                    }
                });
                $scope.tree = tree[0];
                $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closePrdItms();">Close</a></td></tr></table>' + recurseProductItems(tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closePrdItms();">Close</a></td></tr></table>');
                $scope.recursedItems = true;
                $('#div-hdr-lbr').hide();
                $('#tbl-hdr-lbr').hide();
                $('#slctd_' + $scope.subComponent).css('color', 'red');
                //$('#slctd_' + $scope.subComponent).hover(function () {
                //    $(this).css('color', 'blue');
                //    $(this).css('text-decoration', 'underline');
                //}, function () {
                //    $(this).css('color', 'red');
                //    $(this).css('text-decoration', 'none');
                //});
                $('#div-product-items').show();
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                    showTimedElem('addLbrErrMain');
                }
            });
        } else {
            showLoading(false);
            if (!$scope.recursedItems) {
                var dataMap = {};
                $scope.prdItemsActual.forEach(function (node) {
                    dataMap[node.instanceID] = node;
                });
                var tree = [];
                $scope.prdItemsActual.forEach(function (node) {
                    // find parent
                    var parent = dataMap[node.parentInstanceID];
                    if (parent) {
                        // create child array if it doesn't exist
                        (parent.children || (parent.children = []))
                            // add node to parent's child array
                            .push(node);
                    } else {
                        // parent is null or missing
                        tree.push(node);
                    }
                });
                $scope.tree = tree[0];
                $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closePrdItms();">Close</a></td></tr></table>' + recurseProductItems(tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closePrdItms();">Close</a></td></tr></table>');
                $('#div-hdr-lbr').hide();
                $('#tbl-hdr-lbr').hide();
                $('#slctd_' + $scope.subComponent).css('color', 'red');
                //$('#slctd_' + $scope.subComponent).hover(function () {
                //    $(this).css('color', 'blue');
                //    $(this).css('text-decoration', 'underline');
                //}, function () {
                //    $(this).css('color', 'red');
                //    $(this).css('text-decoration', 'none');
                //});
                $('#div-product-items').show();
                $scope.recursedItems = true;
            } else {
                $('#div-hdr-lbr').hide();
                $('#tbl-hdr-lbr').hide();
                $('#slctd_' + $scope.subComponent).css('color', 'red');
                //$('#slctd_' + $scope.subComponent).hover(function () {
                //    $(this).css('color', 'blue');
                //    $(this).css('text-decoration', 'underline');
                //}, function () {
                //    $(this).css('color', 'red');
                //    $(this).css('text-decoration', 'none');
                //});
                $('#div-product-items').show();
            }
        }
    }

    $scope.slctPrdItm = function (itemKey) {
        $('#slctd_' + $scope.subComponent).css('color', '');
        for (var i = 0; i < $scope.prdItemsActual.length; i++) {
            if (itemKey == $scope.prdItemsActual[i].instanceID) {
                $scope.subComponent = $scope.prdItemsActual[i].instanceID;
                $scope.subComponentName = $scope.prdItemsActual[i].description;
                break;
            }
        }
        $('#div-product-items').hide();
        $('#div-hdr-lbr').show();
        $('#tbl-hdr-lbr').show();
    }

    $scope.updLbrTms = function () {
        if (isNaN($scope.hours) || $scope.hours % 1 != 0 || $scope.hours.toString().indexOf(".") > 0) {
            $('#addLbrErrMain').html('Please enter whole numbers in hours.');
            showTimedElem('addLbrErrMain');
            return;
        }
        if (parseInt($scope.hours) > 23) {
            $('#addLbrErrMain').html('Please enter fewer hours/minutes to calculate end date same as start Date.');
            showTimedElem('addLbrErrMain');
            return;
        }
        if (parseInt($scope.hours) < 0) {
            $('#addLbrErrMain').html('Please enter hours greater than 0.');
            showTimedElem('addLbrErrMain');
            return;
        }
        if (parseInt($scope.hours) >= 23 && parseInt($scope.minutes) >= 59) {
            $('#addLbrErrMain').html('Please enter fewer hours/minutes to calculate end date same as start Date.');
            showTimedElem('addLbrErrMain');
            return;
        }
        var sDate = '';
        if (isIPhone()) {
            if ($('#lbrStartDate').val() === undefined || $('#lbrStartDate').val() == '') { //chrome check
                sDate = addTimes((new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " " + new Date().getHours() + ":" + new Date().getMinutes(), $scope.hours, $scope.minutes);
            } else {
                sDate = addTimes($('#lbrStartDate').val().split('-')[1] + "-" + $('#lbrStartDate').val().split('-')[2] + "-" + $('#lbrStartDate').val().split('-')[0] + " " + convertTo24HrFormat($scope.startTime), $scope.hours, $scope.minutes);
            }
        } else {
            if ($('#lbrStDt').val() == '') { //chrome check
                sDate = addTimes((new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " " + new Date().getHours() + ":" + new Date().getMinutes(), $scope.hours, $scope.minutes);
            } else {
                sDate = addTimes($('#lbrStDt').val() + " " + convertTo24HrFormat($('#lbrStTm').val()), $scope.hours, $scope.minutes);
            }
        }
        $scope.endDate = sDate.split(" ")[0];
        $scope.endTime = convertToAmPm(sDate.split(" ")[1]);
    }

    $('#laborMinuteSelect').change(function () {
        var scope = angular.element($("#div-product-items")).scope();
        scope.minutes = document.getElementById('laborMinuteSelect').value;
        if (scope.hours === undefined || scope.hours == "") {
            scope.hours = 0;
        }
        scope.$apply(scope.updLbrTms());
    });

    $('#laborHour').change(function () {
        var scope = angular.element($("#div-product-items")).scope();
        if (scope.hours === undefined || scope.hours == "") {
            scope.hours = 0;
        }
        if (scope.minutes === undefined) {
            scope.minutes = '00';
        }
        scope.$apply(scope.updLbrTms());
    });

    if (!isIPhone()) {
        $('#lbrStDt').change(function () {
            var scope = angular.element($("#div-product-items")).scope();
            if (scope.hours === undefined || scope.hours == "") {
                scope.hours = 0;
            }
            if (scope.minutes === undefined) {
                scope.minutes = '00';
            }
            scope.$apply(scope.updLbrTms());
        });
    }

    $scope.endTime = "";
    $scope.UOM = "HR";
    $scope.addLabor = function (nextEntry) {
        if (isIPhone()) {
            if ($('#lbrStartDate').val() != '') {
                $scope.startDate = $('#lbrStartDate').val().split('-')[1] + "-" + $('#lbrStartDate').val().split('-')[2] + "-" + $('#lbrStartDate').val().split('-')[0];
            } else {
                $('#addLbrErrMain').html('Start Date cannot be empty.');
                showTimedElem('addLbrErrMain');
                return;
            }
        }
        if ($scope.reason === undefined || $scope.reason == "") {
            $('#addLbrErrMain').html('Reason code cannot be empty.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if ($scope.startDate === undefined || $scope.startDate == "") {
            $('#addLbrErrMain').html('Start Date cannot be empty.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if ($scope.startTime === undefined || $scope.startTime == "") {
            $('#addLbrErrMain').html('Start Time cannot be empty.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if ($scope.hours === undefined || $scope.hours == "") {
            if ($scope.hours != 0) {
                $('#addLbrErrMain').html('Hours cannot be empty.');
                showTimedElem('addLbrErrMain');
                return;
            }
        }

        if (isNaN($scope.hours) || $scope.hours % 1 != 0 || $scope.hours.toString().indexOf(".") > 0) {
            $('#addLbrErrMain').html('Please enter whole numbers in hours.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if (parseInt($scope.hours) > 23) {
            $('#addLbrErrMain').html('Please enter fewer hours/minutes to calculate end date same as start Date.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if (parseInt($scope.hours) < 0) {
            $('#addLbrErrMain').html('Please enter hours greater than 0.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if (parseInt($scope.hours) >= 23 && parseInt($scope.minutes) >= 59) {
            $('#addLbrErrMain').html('Please enter fewer hours/minutes to calculate end date same as start Date.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if ($scope.hours !== undefined && $scope.minutes !== undefined) {
            if (parseInt($scope.hours) < 0) {
                $('#addLbrErrMain').html('Hours cannot be negative.');
                showTimedElem('addLbrErrMain');
                return;
            }
            if (parseInt($scope.hours) == 0 && parseInt($scope.minutes) == 0) {
                $('#addLbrErrMain').html('Labor duration cannot be zero.');
                showTimedElem('addLbrErrMain');
                return;
            }
        }

        if ($scope.minutes === undefined || $scope.minutes == "") {
            $('#addLbrErrMain').html('Minutes cannot be empty.');
            showTimedElem('addLbrErrMain');
            return;
        }

        if ($scope.subComponent === undefined || $scope.subComponent == "") {
            if ($scope.tskD.TSK.installFlg == 'yes' && $scope.tskD.TSK.SystemID != '') {
            } else {
                $('#addLbrErrMain').html('Please select a sub component.');
                showTimedElem('addLbrErrMain');
                return;
            }
        }
        var lbrStDtTemp = '';
        if (isIPhone()) {
            lbrStDtTemp = $('#lbrStartDate').val().split('-')[1] + "-" + $('#lbrStartDate').val().split('-')[2] + "-" + $('#lbrStartDate').val().split('-')[0];
        } else {
            lbrStDtTemp = $('#lbrStDt').val();
        }
        if (lbrStDtTemp != $scope.endDate) {
            $('#addLbrErrMain').html('You cannot enter a labor debrief spanning 2 days.');
            showTimedElem('addLbrErrMain');
            return;
        }
        if (new Date($scope.tskD.TSK.SiteIncidentDate) > new Date(lbrStDtTemp + " " + $scope.startTime) || new Date($scope.endDate + " " + $scope.endTime) > new Date((new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " 11:59 PM")) {
            $('#addLbrErrMain').html('Labor date/time should be between SR Open date and today.');
            showTimedElem('addLbrErrMain');
            return;
        }
        var errStatusRowId = "";
        if ($scope.syncStatus == 'E ') {
            errStatusRowId = selectedLabor.SqlID;
        }
        var laborClass = {
            taskID: $routeParams.taskId,
            LaborMeaning: $scope.reason,
            StartDate: lbrStDtTemp,
            StartTime: $scope.startTime,
            EndDate: $filter('date')($scope.endDate, 'MM-dd-yyyy'),
            EndTime: $scope.endTime,
            UOM: $scope.UOM,
            ServiceDate: $filter('date')($scope.startDate, 'MM-dd-yyyy'),
            ServiceTime: $scope.startTime,
            Subcomponent: $scope.subComponent,
            DebriefLineID: $scope.laborDebriefID,
            ParentID: $scope.parentID,
            ErrStatusRowId: errStatusRowId
        };
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Labors/addLabor",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(laborClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (nextEntry) {
                $scope.reason = "";
                $scope.startDate = $scope.endDate;
                $scope.startTime = $scope.endTime;
                $scope.hours = "0";
                $scope.minutes = "00";
                $scope.endDate = $scope.startDate;
                $scope.endTime = $scope.startTime;
            } else {
                if ($scope.laborDebriefID != "" || $scope.parentID != 0) {
                    $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/udLbrMsg");
                } else {
                    $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/adLbrMsg");
                }
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('addLbrErrMain');
            }
        });
    }

    $scope.DeleteLaborDebriefByID = function () {
        showLoading(true);
        var DeleteLaborByIDClass = {
            taskID: $routeParams.taskId,
            parentID: $scope.parentID
        }
        $http({
            method: "POST",
            url: "api/Labors/deleteLaborDebriefByID",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(DeleteLaborByIDClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/dlLbrMsg");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#addLbrErrMain").html("Error: " + data.ExceptionMessage);
                showTimedElem('addLbrErrMain');
            }
        });
    }
    $scope.BackToLabors = function () {
        $location.path('/tasks/' + $routeParams.taskId + '/labors');
    }

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }

        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }
}
AddUpdateLaborsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('AddUpdateLaborsController', AddUpdateLaborsController);

function FDAsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }
    $scope.lbrUsername = fsaApp.session.getUserName();
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
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
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
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId + "/GetFDAQuestions",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        showLoading(false);
        if (data[0] === undefined || data[0] == "") {
            $scope.fdaQ1 = "No";
        } else {
            $scope.fdaQ1 = data[0];
        } if (data[1] === undefined || data[1] == "") {
            $scope.fdaQ2 = "No";
        } else {
            $scope.fdaQ2 = data[1];
        }
        if (data[2] === undefined || data[2] == "") {
            $scope.fdaQ3 = "No";
        } else {
            $scope.fdaQ3 = data[2];
        }
        if (data[3] === undefined || data[3] == "") {
            $scope.fdaQ4 = "No";
        } else {
            $scope.fdaQ4 = data[3];
        }
        if (data[4] === undefined || data[4] == "") {
            $scope.fdaQ5 = "No";
        } else {
            $scope.fdaQ5 = data[4];
        }
    })
    .error(function (data, status, headers, config) {
        if (status == 401) {
            fsaApp.session.removeSessionValue();
            $location.path("/login");
        }
        else {
            $scope.fdaQ1 = "No";
            $scope.fdaQ2 = "No";
            $scope.fdaQ3 = "No";
            $scope.fdaQ4 = "No";
            $scope.fdaQ5 = "No";
        }
        showLoading(false);
    });

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }

        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }

    $scope.updateFDA = function () {
        if ($scope.fdaQ1 === undefined || $scope.fdaQ1 == "") {
            $('#fdaErrMain').html("Please select Yes or No.");
            showTimedElem('fdaErrMain');
            return;
        }

        if ($scope.fdaQ2 === undefined || $scope.fdaQ2 == "") {
            $('#fdaErrMain').html("Please select Yes or No.");
            showTimedElem('fdaErrMain');
            return;
        }

        if ($scope.fdaQ3 === undefined || $scope.fdaQ3 == "") {
            $('#fdaErrMain').html("Please select Yes or No.");
            showTimedElem('fdaErrMain');
            return;
        }

        if ($scope.fdaQ4 === undefined || $scope.fdaQ4 == "") {
            $('#fdaErrMain').html("Please select Yes or No.");
            showTimedElem('fdaErrMain');
            return;
        }

        if ($scope.fdaQ5 === undefined || $scope.fdaQ5 == "") {
            $('#fdaErrMain').html("Please select Yes or No.");
            showTimedElem('fdaErrMain');
            return;
        }

        if ($scope.lbrUsername === undefined || $scope.lbrUsername == "") {
            $('#fdaErrMain').html("Please enter your login.");
            showTimedElem('fdaErrMain');
            return;
        }
        if ($scope.lbrPassword === undefined || $scope.lbrPassword == "") {
            $('#fdaErrMain').html("Please enter your password.");
            showTimedElem('fdaErrMain');
            return;
        }
        showLoading(true);
        var tskStsUpd = true;
        if ($routeParams.lbrTskStsUpd === undefined || $routeParams.lbrTskStsUpd == "") {
            tskStsUpd = false;
        }
        var FDAClass = {
            taskID: $routeParams.taskId,
            FdaQ1: $scope.fdaQ1,
            FdaQ2: $scope.fdaQ2,
            FdaQ3: $scope.fdaQ3,
            FdaQ4: $scope.fdaQ4,
            FdaQ5: $scope.fdaQ5,
            OracleLogin: $scope.lbrUsername,
            OraclePassword: $scope.lbrPassword,
            TskUpd: tskStsUpd
        };
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/updateFDA",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(FDAClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (tskStsUpd) {
                $location.path("/tasks");
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chFdaMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#fdaErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('fdaErrMain');
            }
        });
    }
}
FDAsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('FDAsController', FDAsController);
/*Controllers End*/

function SearchTasksController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    if (isIPhone()) {
        if (window.orientation == 0 || window.orientation == 180) {
            $('#searchSRNumber').width('100px');
            $('#searchTaskNumber').width('100px');
        } else {
            $('#searchSRNumber').width('190px');
            $('#searchTaskNumber').width('190px');
        }
    }
    fsaApp.showContextMenu("");
    $scope.searchTask = function () {
        if (isIPhone()) {
            $(window).on("orientationchange", function (event) {
                $http({
                    method: "GET",
                    url: "api/SearchTasks",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader(),
                    params: { task_number: $scope.searchTaskNumber, sr_number: $scope.searchSRNumber }
                })
                .success(function (data, status, headers, config) {
                    $scope.tasks = data;
                    $scope.numberOfResults = 0;
                    $scope.tasks.forEach(function (node) {
                        node.CustomerName = ProperCase(node.CustomerName);
                        if (isIPhone()) {
                            if (window.orientation == 0 || window.orientation == 180) {
                                if (node.CustomerName.length > 16) {
                                    node.CustomerName = node.CustomerName.substr(0, 12) + '...';
                                }

                                if (node.TaskName.length > 20) {
                                    node.TaskName = node.TaskName.substr(0, 16) + '...';
                                }
                                $('#searchSRNumber').width('100px');
                                $('#searchTaskNumber').width('100px');
                            } else {
                                if (node.CustomerName.length > 32) {
                                    node.CustomerName = node.CustomerName.substr(0, 28) + '...';
                                }

                                if (node.TaskName.length > 40) {
                                    node.TaskName = node.TaskName.substr(0, 36) + '...';
                                }
                                $('#searchSRNumber').width('190px');
                                $('#searchTaskNumber').width('190px');
                            }
                        }
                        switch (node.Status.toLowerCase()) {
                            case 'assigned':
                                node.xImage = 'Assigned.png';
                                break;
                            case 'waiting for parts':
                                node.xImage = 'Waiting.png';
                                break;
                            case 'waiting for test equipment':
                                node.xImage = 'Waiting.png';
                                break;
                            case 'waiting for po':
                                node.xImage = 'Waiting.png';
                                break;
                            case 'system unavailable':
                                node.xImage = 'SystemUnavailable.png';
                                break;
                            case 'open':
                                node.xImage = 'Open.png';
                                break;
                            case 'accepted':
                                node.xImage = 'Accepted.png';
                                break;
                            case 'working':
                                node.xImage = 'Working.png';
                                break;
                            case 'completed':
                                node.xImage = 'Completed.png';
                                break;
                        }
                        $scope.numberOfResults++;
                    });
                    showLoading(false);
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);
                    if ((status == 401) || (status == 0)) {
                        fsaApp.session.removeSessionValue();
                        $location.path("/login");
                    }
                    else {
                        //display error in a label
                        $('#searchTaskErrMain').html("Error: " + data.ExceptionMessage);
                        showTimedElem('searchTaskErrMain');
                    }
                });
            });
        }
        if (($scope.searchTaskNumber === undefined || $scope.searchTaskNumber == "") && ($scope.searchSRNumber === undefined || $scope.searchSRNumber == "")) {
            $('#searchTaskErrMain').html("Please specify a value.");
            showTimedElem('searchTaskErrMain');
            return;
        }
        if ((($scope.searchTaskNumber !== undefined && $scope.searchTaskNumber != "") && isNaN($scope.searchTaskNumber)) || (($scope.searchSRNumber !== undefined && $scope.searchSRNumber != "") && isNaN($scope.searchSRNumber))) {
            $('#searchTaskErrMain').html("Please enter number only.");
            showTimedElem('searchTaskErrMain');
            return;
        }

        showLoading(true);
        $http({
            method: "GET",
            url: "api/SearchTasks",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader(),
            params: { task_number: $scope.searchTaskNumber, sr_number: $scope.searchSRNumber }
        })
        .success(function (data, status, headers, config) {
            $scope.tasks = data;
            $scope.numberOfResults = 0;
            $scope.tasks.forEach(function (node) {
                node.CustomerName = ProperCase(node.CustomerName);
                if (isIPhone()) {
                    if (window.orientation == 0 || window.orientation == 180) {
                        if (node.CustomerName.length > 16) {
                            node.CustomerName = node.CustomerName.substr(0, 12) + '...';
                        }

                        if (node.TaskName.length > 20) {
                            node.TaskName = node.TaskName.substr(0, 16) + '...';
                        }
                        $('#searchSRNumber').width('100px');
                        $('#searchTaskNumber').width('100px');
                    } else {
                        if (node.CustomerName.length > 32) {
                            node.CustomerName = node.CustomerName.substr(0, 28) + '...';
                        }

                        if (node.TaskName.length > 40) {
                            node.TaskName = node.TaskName.substr(0, 36) + '...';
                        }
                        $('#searchSRNumber').width('190px');
                        $('#searchTaskNumber').width('190px');
                    }
                }
                switch (node.Status.toLowerCase()) {
                    case 'assigned':
                        node.xImage = 'Assigned.png';
                        break;
                    case 'waiting for parts':
                        node.xImage = 'Waiting.png';
                        break;
                    case 'waiting for test equipment':
                        node.xImage = 'Waiting.png';
                        break;
                    case 'waiting for po':
                        node.xImage = 'Waiting.png';
                        break;
                    case 'system unavailable':
                        node.xImage = 'SystemUnavailable.png';
                        break;
                    case 'open':
                        node.xImage = 'Open.png';
                        break;
                    case 'accepted':
                        node.xImage = 'Accepted.png';
                        break;
                    case 'working':
                        node.xImage = 'Working.png';
                        break;
                    case 'completed':
                        node.xImage = 'Completed.png';
                        break;
                }
                $scope.numberOfResults++;
            });
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                fsaApp.session.removeSessionValue();
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#searchTaskErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('searchTaskErrMain');
            }
        });
    }
}
SearchTasksController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('SearchTasksController', SearchTasksController);

function InventoryController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("");
    showSignOutMenu();
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    showLoading(true);
    $scope.noOfInventories = 0;
    $scope.savedLocations = "Select";
    $http({
        method: "GET",
        url: "api/getSavedLocations",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        //display successfull message; 
        $scope.savedLocationsList = data;
        if ($routeParams.savedLocationID !== undefined && $routeParams.savedLocationID != "" && $routeParams.savedLocationID != null) {
            showLoading(true);
            $scope.savedLocations = $routeParams.savedLocationID;
            $http({
                method: "GET",
                url: "api/getInventory/" + $scope.savedLocations,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                //display successfull message; 
                $scope.inventories = data;
                if ($scope.inventories.length > 0) {
                    $scope.noOfInventories = $scope.inventories.length;
                }
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                    showTimedElem('inventoryErrMsgMain');
                }
            });
        } else {
            showLoading(false);
        }
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
            showTimedElem('inventoryErrMsgMain');
        }
    });



    $('#slctSvdLctns').change(function () {
        if ($(this).find("option:selected").val() == "" || $(this).find("option:selected").val() == "Select") {
            $scope.inventories = "";
            $scope.noOfInventories = 0;
            return;
        }
        showLoading(true);
        $http({
            method: "GET",
            url: "api/getInventory/" + $(this).find("option:selected").val(),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message; 
            $scope.inventories = data;
            if ($scope.inventories.length > 0) {
                $scope.noOfInventories = $scope.inventories.length;
            }
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('inventoryErrMsgMain');
            }
        });
    });
}
InventoryController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('InventoryController', InventoryController);

function InventoryDetailController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    fsaApp.showContextMenu("");
    showAnchorLogo(false);
    showSignOutMenu();
    showLoading(true);
    $http({
        method: "GET",
        url: "api/getInventoryDetail/" + $routeParams.savedLocationID + "/" + $routeParams.inventoryID,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.inventoryDetail = data;
        showLoading(false);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $("#invDetErrMsg").html("Error: " + data.ExceptionMessage);
            showTimedElem('invDetErrMsg');
        }
    });

    $scope.BackToInventory = function () {
        $location.path('inventory/' + $routeParams.savedLocationID);
    }
}
InventoryDetailController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('InventoryDetailController', InventoryDetailController);

function CreateTaskController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    fsaApp.showContextMenu("");
    showAnchorLogo(false);
    showSignOutMenu();
    showLoading(true);
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5)[4] != ":") {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
        } else {
            $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
        }
        showLoading(false);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }

    $scope.createNewTask = function () {
        showLoading(true);
        var CreateTaskClass = {
            TaskID: $routeParams.taskId,
            Description: $scope.taskDescription
        };
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/createNew",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(CreateTaskClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#createTskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('createTskErr');
            }
        });
    }
}
CreateTaskController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('CreateTaskController', CreateTaskController);


function WhereAboutController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    showLoading(true);
    disableToolTip();
    showAnchorLogo(false);
    fsaApp.showContextMenu("");
    showSignOutMenu();
    //$.fn.timepicker.defaults = {
    //    defaultTime: 'current',
    //    disableFocus: false,
    //    isOpen: false,
    //    minuteStep: 15,
    //    modalBackdrop: false,
    //    secondStep: 15,
    //    showSeconds: true,
    //    showInputs: false,
    //    showMeridian: false,
    //    template: 'dropdown',
    //    appendWidgetTo: '.bootstrap-timepicker'
    //};
    $http({
        method: "GET",
        url: "api/getWhereAbout",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        //display successfull message;
        $scope.whereAboutsType = data.whereAboutsType;
        $scope.unavailableDate = data.unavailableDate.replace("/", "-").replace("/", "-");
        $scope.startTime = data.startTime;
        if ($scope.startTime == "") {
            $scope.startTime = new Date().getHours() + ":" + new Date().getMinutes();
        }
        if ($scope.startTime.split(" ")[0].length == 4) {
            $scope.startTime = "0" + $scope.startTime;
        }
        $scope.startTime = convertToAmPm($scope.startTime);
        $scope.returnDate = data.returnDate.replace("/", "-").replace("/", "-");
        $scope.returnTime = data.returnTime;
        if ($scope.returnTime == "") {
            $scope.returnTime = new Date().getHours() + ":" + new Date().getMinutes();
        }
        if ($scope.returnTime.split(" ")[0].length == 4) {
            $scope.returnTime = "0" + $scope.returnTime;
        }
        $scope.returnTime = convertToAmPm($scope.returnTime);
        $scope.lastUpdate = data.lastUpdate.replace("/", "-").replace("/", "-");
        $scope.lastTime = data.lastTime;
        if ($scope.lastTime.split(" ")[0].length == 4) {
            $scope.lastTime = "0" + $scope.lastTime;
        }
        $scope.whereAbouts = data.whereAbouts;
        if (isIPhone()) {
            var inUnavailableHTML = '';
            var inReturnHTML = '';
            $scope.unavailableDate = $scope.unavailableDate.split('-')[2] + "-" + $scope.unavailableDate.split('-')[0] + "-" + $scope.unavailableDate.split('-')[1];
            var tempDate = $scope.unavailableDate.split("-");
            if (tempDate[1].length == 1) {
                tempDate[1] = "0" + tempDate[1];
            }
            if (tempDate[2].length == 1) {
                tempDate[2] = "0" + tempDate[2];
            }
            $scope.unavailableDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
            inUnavailableHTML = '<input id="waUnavailableDate" type="date" ng-model="unavailableDate" class="form-control form-control-mdf" value="' + $scope.unavailableDate + '" />';
            $('#tdUnavailableDate').html(inUnavailableHTML);

            $scope.returnDate = $scope.returnDate.split('-')[2] + "-" + $scope.returnDate.split('-')[0] + "-" + $scope.returnDate.split('-')[1];
            var tempDate = $scope.returnDate.split("-");
            if (tempDate[1].length == 1) {
                tempDate[1] = "0" + tempDate[1];
            }
            if (tempDate[2].length == 1) {
                tempDate[2] = "0" + tempDate[2];
            }
            $scope.returnDate = tempDate[0] + "-" + tempDate[1] + "-" + tempDate[2];
            inReturnHTML = '<input id="waReturnDate" type="date" ng-model="returnDate" class="form-control form-control-mdf" value="' + $scope.returnDate + '" />';
            $('#tdReturnDate').html(inReturnHTML);
        }
        showLoading(false);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $('#waErrMsgMain').html("Error: " + data.ExceptionMessage);
            showTimedElem('waErrMsgMain');
        }
    });
    $scope.SaveWhereAbouts = function () {
        if (isIPhone()) {
            if ($('#waUnavailableDate').val() != "") {
                $scope.unavailableDate = $('#waUnavailableDate').val().split('-')[1] + "-" + $('#waUnavailableDate').val().split('-')[2] + "-" + $('#waUnavailableDate').val().split('-')[0];
            }
            if ($('#waReturnDate').val() != "") {
                $scope.returnDate = $('#waReturnDate').val().split('-')[1] + "-" + $('#waReturnDate').val().split('-')[2] + "-" + $('#waReturnDate').val().split('-')[0];
            }
        } else {
            $scope.unavailableDate = $('#unavailableStDt').val();
            $scope.returnDate = $('#waRtDt').val();
        }

        var WAClass = {};
        WAClass = {
            whereAboutsType: $scope.whereAboutsType,
            unavailableDate: $scope.unavailableDate,
            startTime: convertTo24HrFormat($scope.startTime),
            returnDate: $scope.returnDate,
            returnTime: convertTo24HrFormat($scope.returnTime),
            lastUpdate: $scope.lastUpdate,
            lastTime: $scope.lastTime,
            whereAbouts: $scope.whereAbouts
        };
        showLoading(true);
        $http({
            method: "POST",
            url: "api/updateWhereAbout",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(WAClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            $location.path("/tasks/rtnTsk/WAUpdate");
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#waErrMsgMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('waErrMsgMain');
            }
        });
    }

    $scope.BackToTasks = function () {
        $location.path("/tasks");
    }
}
WhereAboutController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('WhereAboutController', WhereAboutController);

function MaterialsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    showLoading(true);
    disableToolTip();
    showAnchorLogo(false);
    showSignOutMenu();
    $scope.materialType = "Remove";
    $('#div-inventory').hide();
    $('#div-product-items').hide();
    $('#itemSelection').hide();
    $('#exchangeMaterialConfirmation').hide();
    $('#NonSerializedItemsDiv').hide();
    $('#materialConfirmScreen').hide();
    $scope.currentMaterialDiv = 1;
    if ($scope.savedLocations === undefined || $scope.savedLocations == "") {
        $scope.savedLocations = 'Select';
    }
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.BackToTask = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    };
    $scope.statusOption = $scope.statusOptions[1];
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.installFlg == 'yes' && $scope.tskD.TSK.SystemID != '') {
            $scope.currentMaterialDiv = 0;
            $('#div-inventory').hide();
            $('#div-product-items').hide();
            $('#itemSelection').hide();
            $('#exchangeMaterialConfirmation').hide();
            $('#NonSerializedItemsDiv').hide();
            $('#materialConfirmScreen').hide();
            $('#TaskDetail').hide();
            $('#preInstallDiv').show();
        }
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
            $location.path("/tasks/" + $routeParams.taskId);
        }
        $http({
            method: "GET",
            url: "api/getMaterials/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.installedMaterials = data[0];
            $scope.removedMaterials = data[1];
            $scope.exchangedMaterials = data[2];
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $scope.installedMaterialsCount = 0;
                $scope.removedMaterialsCount = 0;
                $('#materialError').html("Error: " + data.ExceptionMessage);
                showTimedElem('materialError');
            }
        });
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.updateMaterials = function (screenType) {
        showLoading(true);
        $http({
            method: "GET",
            url: "api/getMaterials/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.installedMaterials = data[0];
            $scope.removedMaterials = data[1];
            $scope.exchangedMaterials = data[2];
            if (screenType == "#installedMaterials") {
                $scope.currentMaterialDiv = 1;
            }

            if (screenType == "#removedMaterials") {
                $scope.currentMaterialDiv = 2;
            }

            if (screenType == "#changedMaterials") {
                $scope.currentMaterialDiv = 3;
            }
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $scope.installedMaterialsCount = 0;
                $scope.removedMaterialsCount = 0;
                $('#materialError').html("Error: " + data.ExceptionMessage);
                showTimedElem('materialError');
            }
        });
    }
    $scope.partQuantity = "1";

    $scope.showMaterials = function (typeOfLogic) {
        showLoading(true);
        $scope.returnReason = "Select";
        $scope.materialType = typeOfLogic;
        if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
            $http({
                method: "GET",
                url: "api/Labors/" + $scope.tskD.TSK.IncidentID + "/GetProductItems",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                showLoading(false);
                $scope.prdItemsActual = data;
                var dataMap = {};
                $scope.prdItemsActual.forEach(function (node) {
                    dataMap[node.instanceID] = node;
                });
                var tree = [];
                $scope.prdItemsActual.forEach(function (node) {
                    // find parent
                    var parent = dataMap[node.parentInstanceID];
                    if (parent) {
                        // create child array if it doesn't exist
                        (parent.children || (parent.children = []))
                            // add node to parent's child array
                            .push(node);
                    } else {
                        // parent is null or missing
                        tree.push(node);
                    }
                });
                $('#div-product-items').html('');
                var srcType = 'installedMaterials';
                if ($scope.currentMaterialDiv == 1) {
                    srcType = 'installedMaterials';
                    $scope.tree = tree;
                    $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                }
                if ($scope.currentMaterialDiv == 2) {
                    srcType = 'removedMaterials';
                    $scope.tree = tree;
                    $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td class="td-al-lft"><a class="lnk-prd-itms-cls" onclick="ShowNonSerializedItems();">Non-serialized Items</a></td><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                }
                if ($scope.currentMaterialDiv == 3) {
                    srcType = 'changedMaterials';
                    $scope.tree = tree;
                    if ($scope.materialType == "Removed") {
                        $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td class="td-al-lft"><a class="lnk-prd-itms-cls" onclick="ShowNonSerializedItems();">Non-serialized Items</a></td><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                    } else {
                        $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                    }
                }

                $scope.recursedItems = true;
                $('#slctd_' + $scope.subComponent).css('color', 'red');
                $('#TaskDetail').show();
                $('#installedMaterials').hide();
                $('#removedMaterials').hide();
                $('#changedMaterials').hide();
                $('#TaskDetail').hide();
                $('#div-inventory').hide();
                $('#NonSerializedItemsDiv').hide();
                $('#materialConfirmScreen').hide();
                $('#exchangeMaterialConfirmation').hide();
                $('#div-product-items').show();
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#materialError').html("Error: " + data.ExceptionMessage);
                    showTimedElem('materialError');
                }
            });
        } else {
            showLoading(true);
            //var dataMap = {};
            //$scope.prdItemsActual.forEach(function (node) {
            //    dataMap[node.instanceID] = node;
            //});
            //var tree = [];
            //$scope.prdItemsActual.forEach(function (node) {
            //    // find parent
            //    var parent = dataMap[node.parentInstanceID];
            //    if (parent) {
            //        // create child array if it doesn't exist
            //        (parent.children || (parent.children = []))
            //            // add node to parent's child array
            //            .push(node);
            //    } else {
            //        // parent is null or missing
            //        tree.push(node);
            //    }
            //});
            $('#div-product-items').html('');
            var srcType = 'installedMaterials';
            if ($scope.currentMaterialDiv == 1) {
                srcType = 'installedMaterials';
                //$scope.tree = tree[0];
                $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
            }
            if ($scope.currentMaterialDiv == 2) {
                srcType = 'removedMaterials';
                //$scope.tree = tree[0];
                $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td class="td-al-lft"><a class="lnk-prd-itms-cls" onclick="ShowNonSerializedItems();">Non-serialized Items</a></td><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
            }
            if ($scope.currentMaterialDiv == 3) {
                srcType = 'changedMaterials';
                //$scope.tree = tree[0];
                if ($scope.materialType == "Removed") {
                    $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td class="td-al-lft"><a class="lnk-prd-itms-cls" onclick="ShowNonSerializedItems();">Non-serialized Items</a></td><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                } else {
                    $('#div-product-items').html('<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>' + recurseMaterials($scope.tree) + '<table class="table table-modified tbl-top-shw"><tr><td id="cls-prd-itm-dlg"><a class="lnk-prd-itms-cls" onclick="closeMaterials(\'' + srcType + '\');">Close</a></td></tr></table>');
                }
            }
            $('#slctd_' + $scope.subComponent).css('color', 'red');
            $('#installedMaterials').hide();
            $('#removedMaterials').hide();
            $('#changedMaterials').hide();
            $('#div-inventory').hide();
            $('#TaskDetail').hide();
            $('#materialConfirmScreen').hide();
            $('#NonSerializedItemsDiv').hide();
            $('#exchangeMaterialConfirmation').hide();
            $('#div-product-items').show();
            showLoading(false);
        }
    }

    $scope.SelectNonSerializedItem = function (itemKey) {
        showLoading(true);
        for (var i = 0; i < $scope.nonSerializedItemsList.length; i++) {
            if (itemKey == $scope.nonSerializedItemsList[i].itemNumber) {
                if ($scope.materialType == "Removed") {
                    //$scope.removeParentPartNumber = $scope.prdItemsActual[i].instanceID;
                    //$scope.removeParentPartName = $scope.prdItemsActual[i].description;
                    $scope.removeInventoryItemID = $scope.nonSerializedItemsList[i].inventoryItemID;
                    $scope.removePartNumber = $scope.nonSerializedItemsList[i].itemNumber;
                    //$scope.removeSerialNumber = $scope.prdItemsActual[i].serialNumber;
                    $scope.removePartDescription = $scope.nonSerializedItemsList[i].itemDescription;
                    //$scope.removePartNumberID = $scope.prdItemsActual[i].parentInstanceID;
                    $scope.nonSerialized = 1;
                    $('#installedMaterials').hide();
                    $('#removedMaterials').hide();
                    $('#changedMaterials').hide();
                    $('#TaskDetail').hide();
                    $('#div-product-items').hide();
                    $('#div-inventory').hide();
                    $('#itemSelection').hide();
                    $('#exchangeMaterialConfirmation').show();
                    $('#NonSerializedItemsDiv').hide();
                    $('#materialConfirmScreen').hide();
                    showLoading(false);
                } else {
                    $scope.partNumber = $scope.nonSerializedItemsList[i].itemNumber;
                    $scope.partDescription = $scope.nonSerializedItemsList[i].itemDescription;
                    $scope.inventoryItemID = $scope.nonSerializedItemsList[i].inventoryItemID;
                    $scope.nonSerialized = 1;
                    $http({
                        method: "GET",
                        url: "api/getSavedLocations",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: fsaApp.session.getAuthenticationHeader()
                    })
                    .success(function (data, status, headers, config) {
                        //display successfull message; 
                        $scope.removedSavedLocationList = new Array();
                        data.forEach(function (node) {
                            if (node.key[0] == '2') {
                                $scope.removedSavedLocationList.push(node);
                            }
                        });
                        $scope.savedLocations = $scope.removedSavedLocationList[0].value;
                        $http({
                            method: "GET",
                            url: "api/getReturnReasons",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            //display successfull message; 
                            $scope.returnReasonsList = data;
                            $('#installedMaterials').hide();
                            $('#removedMaterials').hide();
                            $('#changedMaterials').hide();
                            $('#TaskDetail').hide();
                            $('#div-product-items').hide();
                            $('#div-inventory').hide();
                            $('#itemSelection').hide();
                            $('#exchangeMaterialConfirmation').hide();
                            $('#NonSerializedItemsDiv').hide();
                            $('#materialConfirmScreen').show();
                            showLoading(false);
                        })
                        .error(function (data, status, headers, config) {
                            showLoading(false);
                            if (status == 401) {
                                $location.path("/login");
                            }
                            else {
                                //display error in a label
                                $('#materialError').html("Error: " + data.ExceptionMessage);
                                showTimedElem('materialError');
                            }
                        });
                    })
                    .error(function (data, status, headers, config) {
                        showLoading(false);
                        if (status == 401) {
                            $location.path("/login");
                        }
                        else {
                            //display error in a label
                            $('#materialError').html("Error: " + data.ExceptionMessage);
                            showTimedElem('materialError');
                        }
                    });
                }
                break;
            }
        }

    }

    $scope.selectMaterialItem = function (itemKey) {
        showLoading(true);
        for (var i = 0; i < $scope.prdItemsActual.length; i++) {
            if (itemKey == $scope.prdItemsActual[i].instanceID) {
                if ($scope.currentMaterialDiv == 3) {
                    if ($scope.materialType == "Removed") {
                        $scope.nonSerialized = 0;
                        $scope.removeParentPartNumber = $scope.prdItemsActual[i].instanceID;
                        $scope.removeInventoryItemID = $scope.prdItemsActual[i].inventoryItemID;
                        $scope.removePartNumber = $scope.prdItemsActual[i].partNumber;
                        $scope.removeSerialNumber = $scope.prdItemsActual[i].serialNumber;
                        $scope.removePartDescription = $scope.prdItemsActual[i].description;
                        $scope.removePartNumberID = $scope.prdItemsActual[i].parentInstanceID;
                        for (var j = 0; j < $scope.prdItemsActual.length; j++) {
                            if ($scope.prdItemsActual[j].instanceID != "") {
                                if ($scope.prdItemsActual[i].parentInstanceID == $scope.prdItemsActual[j].instanceID) {
                                    $scope.removeParentPartName = $scope.prdItemsActual[j].description;
                                }
                            }
                        }
                    }
                    if ($scope.materialType == "Installed") {
                        $scope.installParentPartNumber = $scope.prdItemsActual[i].instanceID;
                        $scope.installParentPartName = $scope.prdItemsActual[i].description;
                        $scope.installPartNumber = $scope.prdItemsActual[i].partNumber;
                        $scope.installSerialNumber = $scope.prdItemsActual[i].serialNumber;
                        $scope.installPartDescription = $scope.prdItemsActual[i].description;
                        $scope.installPartNumberID = $scope.prdItemsActual[i].inventoryItemID;
                    }
                } else {
                    $scope.parentPartNumber = $scope.prdItemsActual[i].instanceID;
                    $scope.partNumber = $scope.prdItemsActual[i].partNumber;
                    $scope.serialNumber = $scope.prdItemsActual[i].serialNumber;
                    $scope.partDescription = $scope.prdItemsActual[i].description;
                    $scope.inventoryItemID = $scope.prdItemsActual[i].inventoryItemID;
                    $scope.parentPartName = $scope.prdItemsActual[i].description;
                    if ($scope.currentMaterialDiv == 1) {
                        $scope.partNumberID = $scope.prdItemsActual[i].inventoryItemID;
                    } else {
                        $scope.partNumberID = $scope.prdItemsActual[i].parentInstanceID;
                        for (var j = 0; j < $scope.prdItemsActual.length; j++) {
                            if ($scope.prdItemsActual[j].instanceID != "") {
                                if ($scope.prdItemsActual[i].parentInstanceID == $scope.prdItemsActual[j].instanceID) {
                                    $scope.parentPartName = $scope.prdItemsActual[j].description;
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        if ($scope.currentMaterialDiv == 1) {
            srcType = 'installedMaterials';
            $http({
                method: "GET",
                url: "api/getSavedLocations",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                //display successfull message; 
                $scope.savedLocationsList = Array();
                data.forEach(function (node) {
                    if (node.key[0] == '1') {
                        $scope.savedLocationsList.push(node);
                    }
                });
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#materialError').html("Error: " + data.ExceptionMessage);
                    showTimedElem('materialError');
                }
            });
            if ($scope.savedLocations === undefined || $scope.savedLocations == "") {
                $scope.savedLocations = 'Select';
            }
            $('#slctSvdLctns').change(function () {
                if ($(this).find("option:selected").val() == "" || $(this).find("option:selected").val() == "Select") {
                    $scope.inventories = "";
                    $scope.noOfInventories = 0;
                    return;
                }
                showLoading(true);
                $http({
                    method: "GET",
                    url: "api/getInventory/" + $(this).find("option:selected").val(),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //display successfull message; 
                    $scope.inventories = data;
                    if ($scope.inventories.length > 0) {
                        $scope.noOfInventories = $scope.inventories.length;
                    }
                    showLoading(false);
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);
                    if (status == 401) {
                        $location.path("/login");
                    }
                    else {
                        //display error in a label
                        $('#materialError').html("Error: " + data.ExceptionMessage);
                        showTimedElem('materialError');
                    }
                });
            });
            $('#installedMaterials').hide();
            $('#removedMaterials').hide();
            $('#changedMaterials').hide();
            $('#TaskDetail').hide();
            $('#div-product-items').hide();
            $('#NonSerializedItemsDiv').hide();
            $('#exchangeMaterialConfirmation').hide();
            $('#materialConfirmScreen').hide();
            $('#div-inventory').show();
        }
        if ($scope.currentMaterialDiv == 2) {
            srcType = 'removedMaterials';
            $http({
                method: "GET",
                url: "api/getReturnReasons",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                //display successfull message; 
                $scope.returnReasonsList = data;
                $http({
                    method: "GET",
                    url: "api/getSavedLocations",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //display successfull message; 
                    $scope.removedSavedLocationList = new Array();
                    data.forEach(function (node) {
                        if (node.key[0] == '2') {
                            $scope.removedSavedLocationList.push(node);
                        }
                    });
                    $('#installedMaterials').hide();
                    $('#removedMaterials').hide();
                    $('#changedMaterials').hide();
                    $('#TaskDetail').hide();
                    $('#div-product-items').hide();
                    $('#div-inventory').hide();
                    $('#itemSelection').hide();
                    $('#exchangeMaterialConfirmation').hide();
                    $('#materialConfirmScreen').show();
                    showLoading(false);
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);
                    if (status == 401) {
                        $location.path("/login");
                    }
                    else {
                        //display error in a label
                        $('#materialError').html("Error: " + data.ExceptionMessage);
                        showTimedElem('materialError');
                    }
                });
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#materialError').html("Error: " + data.ExceptionMessage);
                    showTimedElem('materialError');
                }
            });
        }
        if ($scope.currentMaterialDiv == 3) {
            srcType = 'changedMaterials';
            if ($scope.materialType == "Removed") {
                $('#installedMaterials').hide();
                $('#removedMaterials').hide();
                $('#changedMaterials').hide();
                $('#TaskDetail').hide();
                $('#NonSerializedItemsDiv').hide();
                $('#div-product-items').hide();
                $('#div-inventory').hide();
                $('#itemSelection').hide();
                $('#materialConfirmScreen').hide();
                $('#exchangeMaterialConfirmation').show();
                showLoading(false);
            }
            if ($scope.materialType == "Installed") {
                showLoading(true);
                $('#installedMaterials').hide();
                $('#NonSerializedItemsDiv').hide();
                $('#removedMaterials').hide();
                $('#changedMaterials').hide();
                $('#TaskDetail').hide();
                $('#div-product-items').hide();
                $('#itemSelection').hide();
                $('#materialConfirmScreen').hide();
                $('#exchangeMaterialConfirmation').hide();
                $http({
                    method: "GET",
                    url: "api/getSavedLocations",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //display successfull message; 
                    $scope.savedLocations = "Select";
                    $scope.savedLocationsList = Array();
                    data.forEach(function (node) {
                        if (node.key[0] == '1') {
                            $scope.savedLocationsList.push(node);
                        }
                        $scope.inventories = "";
                        $scope.noOfInventories = 0;
                    });
                    showLoading(false);
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);
                    if (status == 401) {
                        $location.path("/login");
                    }
                    else {
                        //display error in a label
                        $('#materialError').html("Error: " + data.ExceptionMessage);
                        showTimedElem('materialError');
                    }
                });
                if ($scope.savedLocations === undefined || $scope.savedLocations == "") {
                    $scope.savedLocations = 'Select';
                }
                $('#slctSvdLctns').change(function () {
                    if ($(this).find("option:selected").val() == "" || $(this).find("option:selected").val() == "Select") {
                        $scope.inventories = "";
                        $scope.noOfInventories = 0;
                        return;
                    }
                    showLoading(true);
                    $http({
                        method: "GET",
                        url: "api/getInventory/" + $(this).find("option:selected").val(),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: fsaApp.session.getAuthenticationHeader()
                    })
                    .success(function (data, status, headers, config) {
                        //display successfull message; 
                        $scope.inventories = data;
                        if ($scope.inventories.length > 0) {
                            $scope.noOfInventories = $scope.inventories.length;
                        }
                        showLoading(false);
                    })
                    .error(function (data, status, headers, config) {
                        showLoading(false);
                        if (status == 401) {
                            $location.path("/login");
                        }
                        else {
                            //display error in a label
                            $('#materialError').html("Error: " + data.ExceptionMessage);
                            showTimedElem('materialError');
                        }
                    });
                });
                $('#div-inventory').show();
            }
        }
    }

    $scope.selectItemToInstall = function (itemToInstall) {
        showLoading(true);
        $scope.selectSerialNumber = "";
        $http({
            method: "GET",
            url: "api/getInventoryDetail/" + $scope.savedLocations + "/" + itemToInstall,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.inventoryDetail = data;
            $scope.partNumber = $scope.inventoryDetail.partNumber;
            $scope.installInventoryItemID = $scope.inventoryDetail.inventoryID;
            $scope.inventoryItemID = $scope.inventoryDetail.inventoryID;
            $scope.selectSize = $scope.inventoryDetail.serialNumbers.length + 1;
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#materialError").html("Error: " + data.ExceptionMessage);
                showTimedElem('materialError');
            }
        });
        $('#installedMaterials').hide();
        $('#removedMaterials').hide();
        $('#changedMaterials').hide();
        $('#NonSerializedItemsDiv').hide();
        $('#TaskDetail').hide();
        $('#div-product-items').hide();
        $('#div-inventory').hide();
        $('#itemSelection').show();
    }

    $scope.selectPart = function () {
        if ($scope.selectSerialNumber === undefined || $scope.selectSerialNumber == "") {
            $('#stsErrMain').html("Please select a serial number.");
            showTimedElem('stsErrMain');
            return;
        }
        showLoading(true);
        $scope.partNumber = $scope.inventoryDetail.partNumber;
        $scope.serialNumber = $scope.selectSerialNumber;
        $scope.partDescription = $scope.inventoryDetail.description;
        $('#installedMaterials').hide();
        $('#removedMaterials').hide();
        $('#changedMaterials').hide();
        $('#TaskDetail').hide();
        $('#NonSerializedItemsDiv').hide();
        $('#div-product-items').hide();
        $('#div-inventory').hide();
        $('#itemSelection').hide();
        $('#materialConfirmScreen').show();
        if ($scope.currentMaterialDiv == 3) {
            if ($scope.returnReasonsList == "" || $scope.returnReasonsList === undefined) {
                $http({
                    method: "GET",
                    url: "api/getReturnReasons",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //display successfull message; 
                    $scope.returnReasonsList = data;
                    $scope.installPartNumber = $scope.inventoryDetail.partNumber;
                    $scope.installSerialNumber = $scope.selectSerialNumber;
                    $scope.installPartDescription = $scope.inventoryDetail.description;
                    $('#materialConfirmScreen').hide();
                    $('#exchangeMaterialConfirmation').show();
                    showLoading(false);
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);
                    if (status == 401) {
                        $location.path("/login");
                    }
                    else {
                        //display error in a label
                        $('#materialError').html("Error: " + data.ExceptionMessage);
                        showTimedElem('materialError');
                    }
                });
            } else {
                $scope.installPartNumber = $scope.inventoryDetail.partNumber;
                $scope.installSerialNumber = $scope.selectSerialNumber;
                $scope.installPartDescription = $scope.inventoryDetail.description;
                $('#materialConfirmScreen').hide();
                $('#exchangeMaterialConfirmation').show();
                showLoading(false);
            }
        } else {
            showLoading(false);
        }
    }

    $scope.removeNonSerializedItem = function () {
        if ($scope.returnReason === undefined || $scope.returnReason == "Select" || $scope.returnReason == "") {
            $("#materialConfirmErr").html("Remove Reason cannot be empty.");
            showTimedElem('materialConfirmErr');
        }
        showLoading(true);
        var materialClass = {
            taskID: $routeParams.taskId,
            inventoryItemID: $scope.inventoryItemID,
            subInventoryCode: $scope.savedLocations,
            quantity: $scope.partQuantity,
            returnReason: $scope.returnReason
        };
        $http({
            method: "POST",
            url: "api/removePart",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(materialClass),
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.removedSavedLocation = "";
            $scope.inventories = "";
            $scope.inventoryItemID = "";
            $scope.partQuantity = "1";
            $scope.serialNumber = "";
            $scope.partNumberID = "";
            $scope.returnReason = "";
            $scope.nonSerialized = 0;
            $("#materialMsg").html("Material removed successfully");
            showTimedElem('materialMsg');
            closeMaterials('removedMaterials');
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#materialConfirmErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('materialConfirmErr');
            }
        });
    }

    $scope.SaveSelectedMaterial = function () {
        if ($scope.currentMaterialDiv == 1) {
            if ($scope.partQuantity === undefined || $scope.partQuantity == "") {
                $("#materialConfirmErr").html("Quantity cannot be empty.");
                showTimedElem('materialConfirmErr');
                return;
            }
            showLoading(true);
            var materialClass = {
                taskID: $routeParams.taskId,
                subInventoryCode: $scope.savedLocations,
                inventoryItemID: $scope.inventoryItemID,
                quantity: $scope.partQuantity,
                itemSerialNumber: $scope.serialNumber,
                parentProductId: $scope.partNumberID,
                returnReason: ''
            };
            $http({
                method: "POST",
                url: "api/installPart",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(materialClass),
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.savedLocations = "";
                $scope.inventories = "";
                $scope.inventoryItemID = "";
                $scope.partQuantity = "1";
                $scope.serialNumber = "";
                $scope.partNumberID = "";
                $scope.nonSerialized = 0;
                $("#materialMsg").html("Material installed successfully");
                showTimedElem('materialMsg');
                closeMaterials('installedMaterials');
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $("#materialConfirmErr").html("Error: " + data.ExceptionMessage);
                    showTimedElem('materialConfirmErr');
                }
            });
        }
        if ($scope.currentMaterialDiv == 2) {
            if ($scope.partNumber.substr($scope.partNumber.indexOf('000')) == '000') {
                $("#materialConfirmErr").html("Selected Main Item cannot be removed.");
                showTimedElem('materialConfirmErr');
                return;
            }

            if ($scope.partQuantity === undefined || $scope.partQuantity == "") {
                $("#materialConfirmErr").html("Quantity cannot be empty.");
                showTimedElem('materialConfirmErr');
                return;
            }
            if ($scope.returnReason === undefined || $scope.returnReason == "" || $scope.returnReason == "Select") {
                $("#materialConfirmErr").html("Please select a remove reason.");
                showTimedElem('materialConfirmErr');
                return;
            }
            if ($scope.removedSavedLocation === undefined || $scope.removedSavedLocation == "") {
                $("#materialConfirmErr").html("Please select a inventory location.");
                showTimedElem('materialConfirmErr');
                return;
            }
            showLoading(true);
            var materialClass = {
                taskID: $routeParams.taskId,
                subInventoryCode: $scope.removedSavedLocation,
                inventoryItemID: $scope.inventoryItemID,
                quantity: $scope.partQuantity,
                itemSerialNumber: $scope.serialNumber,
                parentProductId: $scope.partNumberID,
                returnReason: $scope.returnReason
            };
            $http({
                method: "POST",
                url: "api/removePart",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(materialClass),
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.removedSavedLocation = "";
                $scope.inventories = "";
                $scope.inventoryItemID = "";
                $scope.partQuantity = "1";
                $scope.serialNumber = "";
                $scope.partNumberID = "";
                $scope.returnReason = "";
                $scope.nonSerialized = 0;
                $("#materialMsg").html("Material removed successfully");
                showTimedElem('materialMsg');
                closeMaterials('removedMaterials');
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $("#materialConfirmErr").html("Error: " + data.ExceptionMessage);
                    showTimedElem('materialConfirmErr');
                }
            });
        }
        if ($scope.currentMaterialDiv == 3) {
            if ($scope.removePartDescription == "") {
                $("#exchangeMaterialErrMsg").html("Please select a part to remove.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            if ($scope.removePartQuantity === undefined || $scope.removePartQuantity == "") {
                $("#exchangeMaterialErrMsg").html("Remove part quantity cannot be empty.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            if ($scope.removedSavedLocation === undefined || $scope.removedSavedLocation == "") {
                $("#exchangeMaterialErrMsg").html("Remove part inventory location cannot be empty.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            if ($scope.removeReturnReason === undefined || $scope.removeReturnReason == "" || $scope.removeReturnReason == "Select") {
                $("#exchangeMaterialErrMsg").html("Remove part remove reason cannot be empty.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            if ($scope.installPartQuantity === undefined || $scope.installPartQuantity == "") {
                $("#exchangeMaterialErrMsg").html("Install part quantity location cannot be empty.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            if ($scope.savedLocations == "" || $scope.savedLocations == "Select" || $scope.savedLocations === undefined) {
                $("#exchangeMaterialErrMsg").html("Please select part to install.");
                showTimedElem('exchangeMaterialErrMsg');
                return;
            }
            showLoading(true);
            var materialClass = {
                taskID: $routeParams.taskId,

                installSubInventoryCode: $scope.savedLocations,
                installInventoryItemID: $scope.installInventoryItemID,
                installQuantity: $scope.installPartQuantity,
                installItemSerialNumber: $scope.installSerialNumber,
                installParentProductId: $scope.installPartNumberID,

                removeSubInventoryCode: $scope.removedSavedLocation,
                removeInventoryItemID: $scope.removeInventoryItemID,
                removeQuantity: $scope.removePartQuantity,
                removeItemSerialNumber: $scope.removeSerialNumber,
                removeParentProductId: $scope.removePartNumberID,

                returnReason: $scope.removeReturnReason
            };
            $http({
                method: "POST",
                url: "api/exchangePart",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(materialClass),
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.removeParentPartNumber = "";
                $scope.removeParentPartName = "";
                $scope.removeInventoryItemID = "";
                $scope.removePartNumber = "";
                $scope.removeSerialNumber = "";
                $scope.removePartDescription = "";
                $scope.removePartNumberID = "";
                $scope.installParentPartNumber = "";
                $scope.installParentPartName = "";
                $scope.installInventoryItemID = "";
                $scope.installPartNumber = "";
                $scope.installSerialNumber = "";
                $scope.installPartDescription = "";
                $scope.installPartNumberID = "";
                $scope.removePartQuantity = "1";
                $scope.installPartQuantity = "1";
                removeSubInventoryCode = "";
                $scope.nonSerialized = 0;
                $("#materialMsg").html("Materials exchanged successfully");
                showTimedElem('materialMsg');
                closeMaterials('changedMaterials');
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $("#exchangeMaterialErrMsg").html("Error: " + data.ExceptionMessage);
                    showTimedElem('exchangeMaterialErrMsg');
                }
            });
        }

    }

    $scope.SearchNonSearilizedItems = function () {
        if (($scope.nsItemNumber === undefined || $scope.nsItemNumber == "") && ($scope.nsItemDescription === undefined || $scope.nsItemDescription == "")) {
            $('#searchTaskErrMain').html("Please specify a value.");
            showTimedElem('searchTaskErrMain');
            return;
        }

        showLoading(true);
        $http({
            method: "GET",
            url: "api/getNonSerializedItems",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader(),
            params: { item_number: $scope.nsItemNumber, item_description: $scope.nsItemDescription }
        })
        .success(function (data, status, headers, config) {
            $scope.nonSerializedItemsList = data;
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                fsaApp.session.removeSessionValue();
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#searchTaskErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('searchTaskErrMain');
            }
        });
    }

    $scope.showExchangedMaterialScreen = function () {
        showLoading(true);
        $scope.removeParentPartName = "";
        $scope.removePartNumber = "";
        $scope.removePartQuantity = "1";
        $scope.removePartDescription = "";
        $scope.removeSerialNumber = "";
        $scope.removedSavedLocation = "";
        $scope.removeReturnReason = "Select";
        $scope.savedLocations = "Select";
        $scope.installParentPartName = "";
        $scope.installPartNumber = "";
        $scope.installPartQuantity = "1";
        $scope.installSerialNumber = "";
        $scope.installPartDescription = "";
        $http({
            method: "GET",
            url: "api/getSavedLocations",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message; 
            $scope.removedSavedLocationList = new Array();
            data.forEach(function (node) {
                if (node.key[0] == '2') {
                    $scope.removedSavedLocationList.push(node);
                }
            });
            $http({
                method: "GET",
                url: "api/getReturnReasons",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                //display successfull message; 
                $scope.savedLocations = "Select";
                $scope.returnReasonsList = data;
                $('#installedMaterials').hide();
                $('#removedMaterials').hide();
                $('#changedMaterials').hide();
                $('#div-product-items').hide();
                $('#div-inventory').hide();
                $('#NonSerializedItemsDiv').hide();
                $('#itemSelection').hide();
                $('#TaskDetail').hide();
                $('#materialConfirmScreen').hide();
                $('#exchangeMaterialConfirmation').show();
                showLoading(false);
            })
            .error(function (data, status, headers, config) {
                showLoading(false);
                if (status == 401) {
                    $location.path("/login");
                }
                else {
                    //display error in a label
                    $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                    showTimedElem('inventoryErrMsgMain');
                }
            });
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('inventoryErrMsgMain');
            }
        });
    }

    $scope.BackToMaterials = function () {
        if ($scope.currentMaterialDiv == 1) {
            srcType = 'installedMaterials';
        }
        if ($scope.currentMaterialDiv == 2) {
            srcType = 'removedMaterials';
        }
        if ($scope.currentMaterialDiv == 3) {
            srcType = 'changedMaterials';
        }
        closeMaterials(srcType);
    }

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }
}
MaterialsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('MaterialsController', MaterialsController);

function ActiveContractsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    showLoading(true);
    $scope.fromCT = false;
    $('#activeContractsCT').hide();
    $('#activeContractDetails').hide();
    showSignOutMenu();
    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.statusOption = $scope.statusOptions[1];
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    $scope.noOfActiveContracts = 0;
    $http({
        method: "GET",
        url: "api/Tasks/" + $routeParams.taskId,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.tskD = data;
        $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
        if ($scope.tskD.TSK.Status == "Debrief Complete") {
            $location.path("/tasks/" + $routeParams.taskId);
        }
        $http({
            method: "GET",
            url: "api/getActiveContracts/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.activeContracts = data;
            $scope.taskId = $routeParams.taskId;
            $scope.noOfActiveContracts = $scope.activeContracts.length;
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#activeContactMsg").html("Error: " + data.ExceptionMessage);
                showTimedElem('activeContactMsg');
            }
        });
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        }
    });

    $scope.acceptTask = function () {
        if ($scope.statusOption.name == 'Assigned') {
            return;
        }
        showLoading(true);
        $http({
            method: "POST",
            url: "api/Tasks/" + $routeParams.taskId + "/Accept",
            contentType: "application/json; charset=utf-8",
            data: $routeParams.taskId,
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            //display successfull message;
            showLoading(false);
            if (data == -2) {
                $("#tskMsg").html("Task is now assigned to another User.");
                showTimedElem('tskMsg');
            } else {
                $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
            }
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if ((status == 401) || (status == 0)) {
                $location.path("/login");
            }
            else {
                //display error in a label
                $("#tskErr").html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErr');
            }
        });
    }

    $scope.showContractDetails = function (topLineID) {
        showLoading(true);
        for (var i = 0; i < $scope.activeContracts.length; i++) {
            if ($scope.activeContracts[i].ID == topLineID) {
                if ($scope.activeContracts[i].SerialNumbers.length > 1) {
                    var serialNumbersList = $scope.activeContracts[i].SerialNumbers;
                    $scope.activeContractsCTList = new Array();
                    for (var j = 0; j < serialNumbersList.length; j++) {
                        $scope.activeContractsCTList.push({ 0: $scope.activeContracts[i], 1: serialNumbersList[j] });
                    }
                    $('#activeContractsCT').show();
                    $('#activeContractsMain').hide();
                    $('#activeContractDetails').hide();
                    $('#backToTask').hide();
                    showLoading(false);
                } else {
                    $scope.activeContract = new Array();
                    $scope.activeContractTemp = $scope.activeContracts[i];
                    $scope.activeContractTemp.StartDate = $scope.activeContracts[i].StartDate.split(' ')[0];
                    $scope.activeContractTemp.EndDate = $scope.activeContracts[i].EndDate.split(' ')[0];
                    $scope.activeContractTemp.SerialNumber = $scope.activeContracts[i].SerialNumbers[0];
                    $scope.activeContract.push($scope.activeContractTemp);
                    $scope.activeContract.push($scope.activeContracts[i].SerialNumbers[0]);
                    if ($scope.activeContractTemp.ContractType == 'CT') {
                        $http({
                            method: "GET",
                            url: "api/getACCounter/" + $scope.activeContracts[i].ContractNumber + "/" + $scope.activeContractTemp.SerialNumber,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            $scope.activeContract[0].Counter = data.replace('"', '').replace('"', '');
                            $('#activeContractsCT').hide();
                            $('#activeContractsMain').hide();
                            $('#activeContractDetails').show();
                            $('#backToTask').hide();
                            showLoading(false);
                        })
                        .error(function (data, status, headers, config) {
                            showLoading(false);
                        });
                    } else {
                        $('#activeContractsCT').hide();
                        $('#activeContractsMain').hide();
                        $('#activeContractDetails').show();
                        $('#backToTask').hide();
                        showLoading(false);
                    }
                }
            }
        }
    }

    $scope.showForCT = function (serialNumber) {
        showLoading(true);
        $scope.activeContractsCTList.forEach(function (node) {
            if (node[1] == serialNumber) {
                $scope.activeContract = node;
            }
        });
        $http({
            method: "GET",
            url: "api/getACCounter/" + $scope.activeContract.ContractNumber + "/" + $scope.activeContract[1],
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.activeContract[0].Counter = data.replace('"', '').replace('"', '');
            $('#activeContractsCT').hide();
            $('#activeContractsMain').hide();
            $('#activeContractDetails').show();
            $('#backToTask').hide();
            $scope.fromCT = true;
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
        });
    }

    $scope.BackToActiveContracts = function () {
        showLoading(true);
        if ($scope.fromCT) {
            $('#activeContractsCT').show();
            $('#activeContractDetails').hide();
            $('#activeContractsMain').hide();
            $('#backToTask').hide();
            $scope.fromCT = false;
        } else {
            $('#activeContractsCT').hide();
            $('#activeContractDetails').hide();
            $('#activeContractsMain').show();
            $('#backToTask').show();
        }
        showLoading(false);
    }

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }
}
ActiveContractsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('ActiveContractsController', ActiveContractsController);

function ActiveContractDetailsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    showLoading(true);
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    $http({
        method: "GET",
        url: "api/getActiveContract/" + $routeParams.taskId + "/" + $routeParams.activeContractID,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.activeContract = data;
        showLoading(false);
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        }
        else {
            //display error in a label
            $("#activeContactDetMsg").html("Error: " + data.ExceptionMessage);
            showTimedElem('activeContactDetMsg');
        }
    });

    $scope.BackToActiveContracts = function () {
        $location.path("/tasks/" + $routeParams.taskId + "/activeContracts");
    }
}
ActiveContractDetailsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('ActiveContractDetailsController', ActiveContractDetailsController);

function EnterLogin(event) {
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

function showLoading(show) {
    if (show) {
        $('#curtain').show();
        $('#hourGlass').show();
        $('#curtain').css("width", $(document).width());
        $('#curtain').css("height", $(document).height());
        $('#hourGlass').css("left", ($(window).width() / 2) - ($('#hourGlass').width() / 2));
        $('#hourGlass').css("top", ($(window).height() / 2) - ($('#hourGlass').height() / 2));
        $('#hourGlass').focus();
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
    if (time.length < 5) {
        time = "0" + time;
    }
    return day + ' ' + time + ' ' + hour;
}

function deprecateNote(noteDesc, taskID, i, noteID) {
    var tempNote = "";
    if (noteDesc.length > 130) {
        tempNote = noteDesc.substr(0, 100);
        tempNote += " <a href='#/tasks/" + taskID + "/notes' onclick='readMoreToggle(" + noteID + ")'>more...</a>";
    } else {
        tempNote = noteDesc;
    }
    return tempNote;
}

function readMoreToggle(elem) {
    if ($('#td-nts-nte' + elem).css('display') == 'none') {
        $('#td-nts-nte' + elem).show();
        $('#td-nts-nte2' + elem).hide();
    } else {
        $('#td-nts-nte' + elem).hide();
        $('#td-nts-nte2' + elem).show();
    }
}

function showSignOutMenu() {
    var lbhtml = '<a onclick="LogOutMenu();"><img src="Images/LeftBars.png" height="25px" width="45px" align="center" /></a><div id="LogOutDiv"><ul id="leftMenuLogOut"><li id="liUserName"><span id="spanUserName"></span></li><li id="searchTaskLink"><a href="#/searchTask">Search SR/Task</a></li><li id="trunkInventoryLink"><a href="#/inventory">Trunk Inventory</a></li><li id="whereAboutLink"><a href="#/whereAbout">My Whereabouts</a></li><li id="signOutLink"><a href="#" onclick="LogOut();">Sign-Out</a></li></ul></div>';
    $('#leftBars').html(lbhtml);
    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
}

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

function convertTo24HrFormat(time) { //hh:mm AM/PM
    if (time.substr(time.indexOf(" ") + 1) == "AM") {
        if (time.substr(0, time.indexOf(":")) == "12") {
            time = time.replace("12:", "00:");
        }
    } else {
        if (time.substr(0, time.indexOf(":")) != "12") {
            if (time.substr(0, time.indexOf(":"))[0] == "0") {
                time = time.replace(time.substr(0, time.indexOf(":")), parseInt(time.substr(0, time.indexOf(":"))[1]) + 12 + "");
            } else {
                time = time.replace(time.substr(0, time.indexOf(":")), parseInt(time.substr(0, time.indexOf(":"))) + 12 + "");
            }
        }
    }
    return time.substr(0, time.indexOf(" "));
}

function togglePrdItms(elemId) {
    if ($('#prd-itm-hdg-' + elemId).css('display') == 'none') {
        $('#prd-itm-hdg-' + elemId).show();
        $('#spn-itm-hdg-' + elemId).html("<img src='images/collapse_minus.jpg' height='25px' />");
    } else {
        $('#prd-itm-hdg-' + elemId).hide();
        $('#spn-itm-hdg-' + elemId).html("<img src='images/expand_plus.jpg' height='25px' />");
    }
}

function closePrdItms() {
    $('#div-product-items').hide();
    $('#div-hdr-lbr').show();
    $('#tbl-hdr-lbr').show();
}

function selectPrdItm(itmKey) {
    var scope = angular.element($("#div-product-items")).scope();
    scope.$apply(scope.slctPrdItm(itmKey));
}

function selectMaterial(itmKey) {
    var scope = angular.element($("#div-product-items")).scope();
    scope.$apply(scope.selectMaterialItem(itmKey));
}

function updateLaborTimes() {
    alert('this');
    var scope = angular.element($("#div-product-items")).scope();
    if (scope.hours === undefined || scope.hours == "") {
        scope.hours = 0;
    }
    if (scope.minutes === undefined) {
        scope.minutes = '00';
    }
    scope.$apply(scope.updLbrTms());
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function recurseTree(tree, newKey, newId) {
    if (angular.element.isEmptyObject(tree)) {
        tree[newKey] = { _id: newId };
        return;
    }

    var child = null; // find current tree's child
    for (var key in tree) {
        if (key != '_id') {
            child = tree[key]; // found a child
            break;
        }
    }
    if (child) { // recursively process on child
        recurseTree(child, newKey, newId);
    } else { // no child, so just fill the tree
        tree[newKey] = { _id: newId };
    }
}

function recurseProductItems(array) {
    if (array[0].parentInstanceID != "") {
        var piHTML = "<table class='tbl-chld-hdn' id='prd-itm-hdg-" + array[0].parentInstanceID + "'>";
    } else {
        var piHTML = "<table class='tbl-top-shw'>";
    }
    array.forEach(function (node) {
        if (node.description != "") {
            if (node.children !== undefined) {
                piHTML += "<tr><td class='td-prnt'><a onclick='togglePrdItms(" + node.instanceID + ")'><span id='spn-itm-hdg-" + node.instanceID + "'><img src='images/expand_plus.jpg' height='25px' /></span></a><a class='lnk-prd-itms-tgl' id='slctd_" + node.instanceID + "' onclick='selectPrdItm(" + node.instanceID + ");'>" + node.description + "</a></td></tr>";
            } else {
                piHTML += "<tr><td class='td-chld'><a id='slctd_" + node.instanceID + "' class='lnk-prd-itms-tgl' onclick='selectPrdItm(" + node.instanceID + ");'>" + node.description + "</a></td></tr>";
            }
        }
        if (node.children !== undefined) {
            piHTML += "<tr><td>";
            piHTML += recurseProductItems(node.children);
            piHTML += "</tr></td>";
        }
    });
    return piHTML += "</table>";
}

function recurseMaterials(array) {
    if (array[0].parentInstanceID != "") {
        var piHTML = "<table class='tbl-chld-hdn' id='prd-itm-hdg-" + array[0].parentInstanceID + "'>";
    } else {
        var piHTML = "<table class='tbl-top-shw'>";
    }
    array.forEach(function (node) {
        if (node.description != "") {
            if (node.children !== undefined) {
                piHTML += "<tr><td class='td-prnt'><a onclick='togglePrdItms(" + node.instanceID + ")'><span id='spn-itm-hdg-" + node.instanceID + "'><img src='images/expand_plus.jpg' height='25px' /></span></a><a class='lnk-prd-itms-tgl' id='slctd_" + node.instanceID + "' onclick='selectMaterial(" + node.instanceID + ");'>" + node.partNumber + ' - ' + node.description + ' - (' + node.serialNumber + ')' + "</a></td></tr>";
            } else {
                piHTML += "<tr><td class='td-chld'><a id='slctd_" + node.instanceID + "' class='lnk-prd-itms-tgl' onclick='selectMaterial(" + node.instanceID + ");'>" + node.partNumber + '  -  ' + node.description + ' - (' + node.serialNumber + ')' + "</a></td></tr>";
            }
        }
        if (node.children !== undefined) {
            piHTML += "<tr><td>";
            piHTML += recurseMaterials(node.children);
            piHTML += "</tr></td>";
        }
    });
    return piHTML += "</table>";
}

function showAnchorLogo(isLogin) {
    if (isLogin) {
        $('#toshiba-div-wOlink').show();
        $('#toshiba-div-wlink').hide();
    } else {
        $('#toshiba-div-wOlink').hide();
        $('#toshiba-div-wlink').show();
    }
}

function showTimedElem(divName) {
    $('#' + divName).fadeIn('slow');
    $('#' + divName).focus();
    setTimeout(function () { $('#' + divName).fadeOut('slow'); }, 10000);
}

function isValidPhoneNumber(inputtxt) {
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if ((inputtxt.match(phoneno))) {
        return true;
    }
    else {
        return false;
    }
}

function addTimes(dateTime, hr, min) { //mm-dd-yyyy hh:mm
    date = dateTime.split(' ')[0];
    time = dateTime.split(' ')[1];
    curMonth = date.split('-')[0];
    curDay = date.split('-')[1];
    curYear = date.split('-')[2];
    curHour = time.split(':')[0];
    curMin = time.split(':')[1];

    if (curHour[0] == "0") {
        curHour = curHour[1];
    }
    if (curMin[0] == "0") {
        curMin = curMin[1];
    }
    if (curDay[0] == "0") {
        curDay = curDay[1];
    }
    if (curMonth[0] == "0") {
        curMonth = curMonth[1];
    }
    if (parseInt(min) > 0) {
        curMin = parseInt(curMin) + parseInt(min);
    }

    if (parseInt(curMin) > 59) {
        curHour = parseInt(curHour) + 1;
        curMin = curMin - 60;
    }

    if (hr.length > 1 && hr[0] == "0") {
        hr = hr.substr(1);
    }
    if (parseInt(hr) > 0) {
        curHour = parseInt(curHour) + parseInt(hr);
    }

    if (parseInt(curHour) > 23) {
        curDay = parseInt(curDay) + 1;
        curHour = curHour - 24;
    }

    var daysInMonth = 28;
    if (parseInt(curMonth) == 2 && parseInt(curYear) % 4 == 0) {
        daysInMonth = 29;
    } else if (parseInt(curMonth) == 2 && parseInt(curYear) % 4 != 0) {
        daysInMonth = 28;
    } else if (parseInt(curMonth) == 4 || parseInt(curMonth) == 6 || parseInt(curMonth) == 9 || parseInt(curMonth) == 11) {
        daysInMonth = 30;
    } else {
        daysInMonth = 31;
    }

    if (parseInt(curDay) > daysInMonth) {
        curMonth = parseInt(curMonth) + 1;
        curDay = parseInt(curDay) - daysInMonth;
    }

    if (parseInt(curMonth) > 12) {
        curYear = parseInt(curYear) + 1;
        curMonth = parseInt(curMonth) - 12;
    }

    if (curMin.toString().length == 1) {
        curMin = "0" + curMin;
    }

    if (curHour.toString().length == 1) {
        curHour = "0" + curHour;
    }

    if (curDay.toString().length == 1) {
        curDay = "0" + curDay;
    }

    if (curMonth.toString().length == 1) {
        curMonth = "0" + curMonth;
    }

    return curMonth + "-" + curDay + "-" + curYear + " " + curHour + ":" + curMin;
}

function convertToAmPm(time) { //hh:mm
    //alert(time);
    hr = time.split(':')[0];
    if (hr[0] == "0") {
        hr = hr.substr(1);
    }
    min = time.split(':')[1];
    amPm = 'AM';
    if (parseInt(hr) == 0) {
        hr = 12;
    } else if (parseInt(hr) == 12) {
        amPm = 'PM';
    } else if (parseInt(hr) > 12) {
        hr = parseInt(hr) - 12;
        amPm = 'PM';
    }

    if (hr.toString().length == 1) {
        hr = "0" + hr;
    }

    if (min.toString().length == 1) {
        min = "0" + min;
    }

    return hr + ":" + min + " " + amPm;
}

function isAlphaNumeric(iVal) {
    var Exp = /^[a-z0-9]+$/i;
    if (iVal.match(Exp)) {
        return true;
    } else {
        return false;
    }
}

function isIPhone() {
    var iphone = false;
    if (navigator.userAgent.toLowerCase().indexOf('ios') > 0 || navigator.userAgent.toLowerCase().indexOf('iphone') > 0 || navigator.userAgent.toLowerCase().indexOf('ipad') > 0) {
        iphone = true;
    }
    return iphone;
}

function disableToolTip() {
    $('body').tooltip('disable');
    $('div').tooltip('disable');
    $('input').tooltip('disable');
    $('a').tooltip('disable');
    $('tr').tooltip('disable');
    $('td').tooltip('disable');
    $('table').tooltip('disable');
}

function closeMaterials(srcType) {
    $('#installedMaterials').hide();
    $('#removedMaterials').hide();
    $('#changedMaterials').hide();
    $('#TaskDetail').show();
    $('#div-product-items').hide();
    $('#div-inventory').hide();
    $('#itemSelection').hide();
    $('#materialConfirmScreen').hide();
    $('#exchangeMaterialConfirmation').hide();
    $('#NonSerializedItemsDiv').hide();
    $('#' + srcType).show();
    showLoading(true);
    var scope = angular.element($('#' + srcType)).scope();
    scope.$apply(scope.updateMaterials('#' + srcType));
}

function ShowNonSerializedItems() {
    $('#installedMaterials').hide();
    $('#removedMaterials').hide();
    $('#changedMaterials').hide();
    $('#div-inventory').hide();
    $('#TaskDetail').hide();
    $('#materialConfirmScreen').hide();
    $('#exchangeMaterialConfirmation').hide();
    $('#div-product-items').hide();
    $('#NonSerializedItemsDiv').show();
}