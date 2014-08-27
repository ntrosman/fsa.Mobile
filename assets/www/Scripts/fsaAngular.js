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

    if (window.navigator.onLine) {
        $scope.online = true;
        if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
            $("#spanUserName").text(fsaApp.session.getUserName());
            var valuestr = fsaApp.session.getSessionValue();
            if (valuestr != undefined && valuestr != "\"null\"") {
                var userID = JSON.parse(valuestr)['CeID'];
                $scope.UserName = userID;
                syncTaskUpdates($scope, $http);
            } else {
                var userID = undefined;
            }
        }
    } else {
        $scope.online = false;
    }

    document.body.addEventListener("online", function () {
        syncTaskUpdates($scope, $http);
    }, true);

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

    if ($scope.online == true) {

    $http({
        method: "GET",
        url: "api/Tasks",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $rootScope.db = PouchDB('STARS_TASKS', function (err, db) {
            if (err) {
            } else {
                $scope.db = PouchDB('STARS_TASKS');
            }
        });

        $scope.db.get('-tasks', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    var tasksList = {
                        _id: '-tasks',
                        Tasks: data
                    }
                    $scope.db.put(tasksList);
                } else {
                    //       setTimeout($scope.RefreshTasks, 5000);  //uncomment
                    if (JSON.stringify(data) != JSON.stringify(doc['Tasks'])) {
                        var tasksList = {
                            _id: '-tasks',
                            Tasks: data
                        }
                        $scope.db.remove(doc);
                        $scope.db.put(tasksList);
                    }
                }
            })
        })
      
        showLoading(false);

        //===============pouchdb=======================
        $scope.tasks = data;
        transformOpenTasks();
        $scope.taskFilter = {};
        $scope.taskFilter.xStatus = 'Assigned';       
        loadDataLists($scope, $http);
    })
    .error(function (data, status, headers, config) {
      //  showLoading(false);
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

    }else{//working offline
            $scope.db = PouchDB('STARS_TASKS');
            $scope.localFlg = true;
            $scope.db.get('-tasks', function (err, doc) {
            $scope.$apply(function () {
            if (err) {
                //     showLoading(false);                  
                //display error in a label
                $('#tskErrMain').html("Error: " + data.ExceptionMessage);
                showTimedElem('tskErrMain');                       
            } else {                                  
                $scope.tasks = doc['Tasks'];                    
                transformOpenTasks();
                $scope.taskFilter = {};
                $scope.taskFilter.xStatus = 'Assigned';           
            }
        })
    })
}

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
            //    showLoading(false);
                $scope.tasks = data;
                transformOpenTasks();
                $scope.taskFilter = {};
                $scope.taskFilter.xStatus = 'Assigned';
            })
            .error(function (data, status, headers, config) {
             //   showLoading(false);
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

    function transformOpenTasks() {
        //apply transformation on all elements.        
        $scope.db = new PouchDB('STARS_TASKS');
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

            if ($scope.online == true) {
                var tmpStatus = elem.Status.toLowerCase();
                $scope.calculateTotalTasks(elem, tmpStatus);
                return true;              
            } else {//offline mode
                var statusName;
                $scope.db.get(elem.ID + '-taskUpdate', function (err, chgDoc) {//changeStatus', function (err, chgStDoc) {         
                    $scope.$apply(function () {
                        if (err) {
                            var tmpStatus = elem.Status.toLowerCase();
                            $scope.calculateTotalTasks(elem, tmpStatus);
                        } else {
                            if (chgDoc['Category'] == 'ChangeStatus') {
                                $scope.taskUpdate = chgDoc['status'];
                             //   console.log('$scope.taskUpdate = ' + JSON.stringify($scope.taskUpdate));
                                var newStatus;
                                var newStatusName;
                                //      for (var chg in $scope.taskUpdate) {
                                if ($scope.taskUpdate instanceof Array) {
                                    newStatus = $scope.taskUpdate['status'][1];
                                    newstatusName = $scope.taskUpdate['statusName'][2];
                                } else {
                                    newStatus = $scope.taskUpdate['status'];
                                    newstatusName = $scope.taskUpdate['statusName'];
                                }                               
                            }
//                        }
                        var tmpStatus = statusName.toLowerCase();
                        $scope.calculateTotalTasks(elem, tmpStatus);
                       }
                   //     showLoading(false);
                    })
                })       
                showLoading(false);
                return true;
            }
        });  
        showLoading(false);
        return true;
    }

    $scope.calculateTotalTasks = function (elem, tmpStatus) {
        switch ( tmpStatus) {  //elem.Status.toLowerCase()) {
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
        showLoading(false);
        return true;
    }

    $scope.filterTaskView = function (filterValue) {
     //   showLoading(true);
        $scope.taskFilter.xStatus = filterValue;
        $scope.currentView = filterValue;
      //  showLoading(false);
    }
}
TasksController.$inject = ['$rootScope', '$scope', '$location', '$http', '$routeParams'];
fsaModule.controller('TasksController', TasksController);

function TaskDetailController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

//    document.body.addEventListener("online", function () {
//        syncTaskUpdates($scope, $http);
//    }, true);

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

    $scope.statusOptionsInPlanning = [
    { name: 'Accept' },
    { name: 'Auto In Planning' }
    ];
    $scope.statusOptionInPlanning = $scope.statusOptionsInPlanning[1];

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
    $scope.db = PouchDB('STARS_TASKS');
    $scope.dbPending = PouchDB('STARS_PENDING');
    
    if ($scope.online == true) {  //TaskDetailController  
        $('#offlineDiv').hide();
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
            var tmpTaskID = $routeParams.taskId;
            var tmpIncidentID = $scope.tskD.TSK.IncidentID;
            //           $scope.displayTaskDetails(); 
            ///////////////////////////////
            $scope.getTaskUpdates();
            ///////////////////////////////
            $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        var taskDetails = {
                            _id: tmpTaskID + '-details',
                            TaskID: tmpTaskID,
                            UserID: $scope.UserName,
                            TaskDetails: data
                        }
                        $scope.db.put(taskDetails);                    
                    } else {
                        if (JSON.stringify(doc['Tasks']) != JSON.stringify(data)) {
                            var taskDetails = {
                                _id: tmpTaskID + '-details',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskDetails: data
                            }
                            $scope.db.remove(doc);
                            $scope.db.put(taskDetails);
                        }
                    }
                })
            })
            //!!! check for status updates, sync if there is any pending entries
        //    $scope.getTaskUpdates();
            if ($scope.status == null || $scope.status == undefined || $scope.status == '') {
                $scope.status = $scope.tskD.TSK.StatusID;
                $scope.statusName = $scope.tskD.TSK.Status;
                $scope.displayTaskDetails();
            } else {
                $scope.displayTaskDetails();
            }
           // getStatusOptions($scope, $http);          
          //  $scope.displayTaskDetails();
            getStatusOptions($scope, $http);
        })

        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                TaskStoreID = document.URL.substr(document.URL.lastIndexOf('/') + 1);
                localStorage.setItem("fsaSessionObject", "");
                $location.path("/login");
            }else {
                //display error in a label
                $location.path("/tasks/rtnTsk/rtvTskDetMsg");
            }
        });      

    } else {//offline  TaskDetailController               

        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
            $scope.$apply(function () {
                if (err) {                   
                } else {                
                    $scope.tskD = doc['TaskDetails'];            
                    $scope.getTaskUpdates();              
                    if ($scope.status == null || $scope.status == undefined || $scope.status == '') {
                        $scope.status = $scope.tskD.TSK.StatusID;                      
                        $scope.statusName = $scope.tskD.TSK.Status;
                    }                                     
                    $scope.displayTaskDetails();
                    getStatusOptions($scope, $http);
                    //  }
                }
            })
        })
    }

    $scope.displayTaskDetails = function () {       
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

        //  $scope.status = $scope.tskD.TSK.StatusID;
        //  $scope.statusName = $scope.tskD.TSK.Status;

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

        if ($scope.online == true) {
            $http({
                method: "GET",
                url: "api/Tasks/" + $scope.tskD.TSK.IncidentID + "/GetTaskNotes",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.tskD.taskNotes = data;
                $scope.db.get($scope.tskD.TSK.IncidentID + '-SRnotes', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var srNotes = {
                                _id: $routeParams.taskId + '-SRnotes',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                SRNotes: data
                            }
                            $scope.db.put(srNotes);
                        } else {
                            if (JSON.stringify(doc['SRNotes']) != JSON.stringify(data)) {
                                var srNotes = {
                                    _id: $routeParams.taskId + '-SRnotes',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    SRNotes: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(srNotes);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {

            });
        } else {
            $scope.db.get($routeParams.taskId + '-SRnotes', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        showLoading(false);
                    } else {
                        $scope.tskD.taskNotes = doc['SRNotes'];
                    }
                })
            })
        }

        if ($scope.online == true) {
            $http({
                method: "GET",
                url: "api/Tasks/" + $scope.tskD.TSK.IncidentID + "/GetCounter",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.tskD.CurrentCounter = data;

                $scope.db.get($routeParams.taskId + '-taskCounter', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskCounter = {
                                _id: $routeParams.taskId + '-counter',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskCounter: data
                            }
                            $scope.db.put(taskCounter);
                        } else {
                            if (JSON.stringify(doc['TaskCounter']) != JSON.stringify(data)) {
                                var taskCounter = {
                                    _id: $routeParams.taskId + '-counter',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskCounter: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskCounter);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {

            });
        } else {
            $scope.db.get($routeParams.taskId + '-taskCounter', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        showLoading(false);
                    } else {
                        $scope.tskD.CurrentCounter = doc['TaskCounter'];
                    }
                })
            })
            $('#offlineDiv').show();
        }

        if ($scope.online == true) {
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
                $scope.db.get($routeParams.taskId + '-managerApproval', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskManagerApproval = {
                                _id: $routeParams.taskId + '-managerApproval',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskManagerApproval: data
                            }
                            $scope.db.put(taskManagerApproval);
                        } else {
                            if (JSON.stringify(doc['TaskManagerApproval']) != JSON.stringify(data)) {
                                var taskManagerApproval = {
                                    _id: $routeParams.taskId + '-managerApproval',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskManagerApproval: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskManagerApproval);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {

            });
        } else {//offline mode
            $scope.db.get($routeParams.taskId + '-managerApproval', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {

                    } else {
                        $scope.managerApprovalTemp = doc['TaskManagerApproval'].substr(doc['TaskManagerApproval'].indexOf("\"") + 1).substr(0, doc['TaskManagerApproval'].indexOf("\"") + 1);
                        $scope.managerApproval = $scope.managerApprovalTemp;
                    }
                })
            })
            $('#offlineDiv').show();
        }

        $scope.tamsDown = '';
        if ($scope.online == true) {
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
                $scope.db.get($routeParams.taskId + '-systemDown', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskSystemDown = {
                                _id: $routeParams.taskId + '-systemDown',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskSystemDown: data
                            }
                            $scope.db.put(taskSystemDown);
                        } else {
                            if (JSON.stringify(doc['TaskSystemDown']) != JSON.stringify(data)) {
                                var taskSystemDown = {
                                    _id: $routeParams.taskId + '-systemDown',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskSystemDown: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskSystemDown);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {

            });
        } else {//offline mode
            $scope.db.get($routeParams.taskId + '-systemDown', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {

                    } else {
                        if (doc['TaskSystemDown']['sysDown'] != "null" && (doc['TaskSystemDown']['sysDown'] == "1" || doc['TaskSystemDown']['sysDown'] == "Yes")) {
                            $scope.sysDown = "Yes";
                        }
                        if (doc['TaskSystemDown']['sysAvailable'] != "null" && (doc['TaskSystemDown']['sysAvailable'] == "1" || doc['TaskSystemDown']['sysAvailable'] == "Yes")) {
                            $scope.sysAvailable = "Yes";
                        }
                        if (doc['TaskSystemDown']['cfmDown'] != "null") {
                            $scope.cfmDown = doc['TaskSystemDown']['cfmDown'];
                            $scope.tamsDown = $scope.cfmDown;
                            $scope.confirmDownSet = true;
                        } else {
                            $scope.confirmDownSet = false;
                        }
                        if (doc['TaskSystemDown']['sysUpDate'] != "" && doc['TaskSystemDown']['sysUpDate'] != "0001-01-01T00:00:00") {
                            $scope.systemUpDate = doc['TaskSystemDown']['sysUpDate'].toString().substr(0, doc['TaskSystemDown']['sysUpDate'].toString().indexOf("T")).split("-")[1] + "-" + doc['TaskSystemDown']['sysUpDate'].toString().substr(0, doc['TaskSystemDown']['sysUpDate'].toString().indexOf("T")).split("-")[2] + "-" + doc['TaskSystemDown']['sysUpDate'].toString().substr(0, doc['TaskSystemDown']['sysUpDate'].toString().indexOf("T")).split("-")[0];
                            $scope.systemUpTime = convertToAmPm(doc['TaskSystemDown']['sysUpDate'].toString().substr(doc['TaskSystemDown']['sysUpDate'].toString().indexOf("T") + 1, 5));
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
                    }
                })
            })
            $('#offlineDiv').show();
        }

        if ($scope.online == true) {
            $http({
                method: "GET",
                url: "api/Tasks/" + $routeParams.taskId + "/GetFaxEmail",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                if (data.ItemArray[0] !== undefined && data.ItemArray[0] != "" && data.ItemArray[0] != null) {
                    $scope.attention = data.ItemArray[0];
                }

                if (data.ItemArray[1] !== undefined && data.ItemArray[1] != "" && data.ItemArray[1] != null) {
                    $scope.fax = data.ItemArray[1];
                }

                if (data.ItemArray[2] !== undefined && data.ItemArray[2] != "" && data.ItemArray[2] != null) {
                    if (data.ItemArray[2].toString().indexOf("@") > 0) {
                        $scope.email = data.ItemArray[2];
                    }
                }

                if (data.ItemArray[3] !== undefined && data.ItemArray[3] != "" && data.ItemArray[3] != null) {
                    if ($scope.email == '' || $scope.email == undefined) {
                        $scope.email = data.ItemArray[3];
                    } else {
                        $scope.email += ", " + data.ItemArray[3];
                    }
                }
                if (data.ItemArray[4] !== undefined && data.ItemArray[4] != "" && data.ItemArray[4] != null) {
                    $scope.department = data.ItemArray[4];
                }
                showLoading(false);
                $scope.db.get($routeParams.taskId + '-faxEmail', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskFaxEmail = {
                                _id: $routeParams.taskId + '-faxEmail',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskFaxEmail: data
                            }
                            $scope.db.put(taskFaxEmail);
                        } else {
                            if (JSON.stringify(doc['TaskFaxEmail']) != JSON.stringify(data)) {
                                var taskFaxEmail = {
                                    _id: $routeParams.taskId + '-faxEmail',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskFaxEmail: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskFaxEmail);
                            }
                        }
                    })
                })
                showLoading(false);
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
            })
        } else {//offline mode
            showLoading(false);
            $scope.db.get($routeParams.taskId + '-faxEmail', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        showLoading(false);
                    } else {
                        if (doc['TaskFaxEmail'].ItemArray[0] !== undefined || doc['TaskFaxEmail'].ItemArray[0] != "") {
                            $scope.attention = doc['TaskFaxEmail'].ItemArray[0];
                        }

                        if (doc['TaskFaxEmail'].ItemArray[1] !== undefined || doc['TaskFaxEmail'].ItemArray[1] != "") {
                            $scope.fax = doc['TaskFaxEmail'].ItemArray[1];
                        }

                        if (doc['TaskFaxEmail'].ItemArray[2] !== undefined || doc['TaskFaxEmail'].ItemArray[2] != "") {
                            $scope.email = doc['TaskFaxEmail'].ItemArray[2];
                        }

                        if (doc['TaskFaxEmail'].ItemArray[3] !== undefined || doc['TaskFaxEmail'].ItemArray[3] != "") {
                            $scope.email += ", " + doc['TaskFaxEmail'].ItemArray[3];
                        }
                        if (doc['TaskFaxEmail'].ItemArray[4] !== undefined || doc['TaskFaxEmail'].ItemArray[4] != "") {
                            $scope.department = doc['TaskFaxEmail'].ItemArray[4];
                        }
                    }
                })
            })
            $('#offlineDiv').show();
        }
    }


    $scope.getTaskUpdates = function() {
        $scope.dbPending = PouchDB('STARS_PENDING');
        $scope.db = PouchDB('STARS_TASKS');

        var newStatus;          
        var newStatusName;
        $scope.dbPending.get($routeParams.taskId + '-statusChange', function (err, doc) {
            $scope.$apply(function () {
                if (err) {               
                    return;
                } else {              
                    if (doc['Category'] == 'ChangeStatus') {
                        var pndStatus = doc['Pending'];                 
                        if (pndStatus instanceof Array) {                            
                            newStatus = pndStatus[pndStatus.length - 1]['status'];            //newStatus['status']; 
                            $scope.status = newStatus;                                                                       
                        } else {                   
                            newStatus = pndStatus['status'];
                            $scope.status = newStatus;                                                                       
                        }                    
                        if ($scope.online == true) {
                            //update status from pouchDb                          
                            syncTaskUpdates($scope, $http);
                            showLoading(false);                        
                            var url = window.location.toString();                      
                        } else {    //offline                    
                            //get StatusName
                            $scope.getStatusName();                  
                        }
                    }                
                }                     
            })
        });
        return true;
    }
    $scope.getStatusName = function () {

    $scope.db.get('-statusList', function (err, docStatusList) {
        $scope.$apply(function () {
            if (err) {
            } else {
                var stsList = docStatusList['StatusList'];
                var foundFlg = false;

                stsList.forEach(function (sts) {
                    if (foundFlg == false) {
                        if (sts.InitialStatusId == $scope.status) {
                            newStatusName = sts.InitialStatusName;
                            $scope.statusName = newStatusName;
                            $scope.tskD.TSK.Status = newStatusName;
                            if ($scope.online == true) {
                             //   $scope.tskD.TSK.StatusID = $scope.status;
                                $scope.tskD.TSK.Status = $scope.statusName;
                            } else {
                                $scope.tskD.TSK.Status = '** ' + $scope.statusName;
                            }
                            getStatusOptions($scope, $http);
                            foundFlg = true;
                        }
                    }
                })
               
            }
        })
    })
    return;
}

    $scope.BackToTaskDetail = function () {
        $location.path("/tasks/" + $routeParams.taskId);
    }

    $scope.currentDiv = 1;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
  
    //TASK Details Controler
    $scope.acceptTask = function () {
        if ($scope.statusOption.name != 'Accept' && $scope.statusOptionInPlanning.name != 'Accept') {
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

    $scope.changeStatus_old = function () {
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

    ///////changestatus_new
    $scope.changeStatus = function () {
        $scope.db = new PouchDB("STARS_TASKS");
        $scope.dbPending = new PouchDB('STARS_PENDING');

     //   console.log('changeStatus; $scope.statusName = ' + $scope.statusName);
        if ($scope.status === undefined) {
            $('#stsErrMain').html("Please select a status.");
            showTimedElem('stsErrMain');
            return;
        }

        if (!Date.now) {
            Date.now = function () { return new Date().getTime(); };
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
                    if (data['TaskFDAQuestions'][0] == "" || data['TaskFDAQuestions'][1] == "" || data['TaskFDAQuestions'][2] == "" || data['TaskFDAQuestions'][3] == "" || data['TaskFDAQuestions'][4] == "") {
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
                            } else {
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
        } else {//$scope.status != 11001 
            var statusClass = {
                status: $scope.status,               
                taskID: $routeParams.taskId
            }
            if ($scope.online == true) {//$scope.changeStatus
                $http({
                    method: "POST",
                    url: "api/Tasks/" + $routeParams.taskId + "/ChangeStatus",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(statusClass),
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
                        $scope.$apply(function () {
                            if (err) {
                                var taskDetails = {
                                    _id: $routeParams.taskId + '-details',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskDetails: data
                                }
                                $scope.db.put(taskDetails);
                            } else {
                                if (JSON.stringify(doc['TaskDetails']) != JSON.stringify(data)) {
                                    var taskDetails = {
                                        _id: $routeParams.taskId + '-details',
                                        TaskID: $routeParams.taskId,
                                        UserID: $scope.UserName,
                                        TaskDetails: data
                                    }
                                    $scope.db.remove(doc);
                                    $scope.db.put(taskDetails);
                                }
                            }
                        })
                    })
                    //display successfull message;                   
                    $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
                    showLoading(false);
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
            } else {//offline process  $scope.changeStatus

                var newStatus = $scope.status;

                showLoading(true);
                $scope.db.get('-statusList', function (err, docStatusList) {
                    $scope.$apply(function () {
                        if (err) {
                            $scope.tskD.TSK.Status = $scope.statusName;
                            $scope.tskD.TSK.StatusID = $scope.StatusID;
                        } else {

                            var stsList = docStatusList['StatusList'];
                            var foundFlg = false;

                            stsList.forEach(function (sts) {
                                if (foundFlg == false) {
                                    if (sts.InitialStatusId == newStatus) {
                                        $scope.newStatusName = sts.InitialStatusName;
                                        $scope.tskD.TSK.Status = '** ' + $scope.newStatusName;
                                        $scope.tskD.TSK.StatusID = newStatus;
                                        foundFlg = true;
                                   //     console.log('$scope.newStatusName1 = ' + $scope.newStatusName + '; newStatus1= ' + newStatus + '; ' + $scope.newStatusName);
                                    }
                                }
                            })
                        }
                        var changeStatus = {
                            _id: $routeParams.taskId + '-taskUpdate',
                            Category: 'ChangeStatus',
                            status: $scope.status,
                            statusName: $scope.newStatusName, //$scope.statusName,
                            taskID: $routeParams.taskId,
                            Pending: statusClass
                        }
                        $scope.dbPending.get($routeParams.taskId + '-statusChange', function (err, statusChgDoc) {  //.then(function (doc) {
                            $scope.$apply(function () {
                                if (err) {
                                    var changeStatus = {
                                        _id: $routeParams.taskId + '-statusChange',
                                        Category: 'ChangeStatus',
                                        status: $scope.status,
                                        statusName: $scope.newStatusName,  //$scope.statusName,
                                        taskID: $routeParams.taskId,
                                        Pending: statusClass
                                    }
                                    $scope.dbPending.put(changeStatus);
                                    showLoading(false);
                                    $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");

                                } else {//no previous changes exists                                           
                                    var tmpArr = [];
                                    var changeStatus = {
                                        _id: $routeParams.taskId + '-statusChange',
                                        Category: 'ChangeStatus',
                                        status: $scope.status,
                                        statusName: $scope.newStatusName, //$scope.statusName,
                                        taskID: $routeParams.taskId,
                                        Pending: statusClass
                                    }
                                    $scope.category = statusChgDoc['Category'];
                                    if ($scope.category == 'ChangeStatus') {
                                        $scope.dbPending.remove(statusChgDoc);
                                        $scope.dbPending.put(changeStatus);
                                    }
                                    showLoading(false);
                                    $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
                                }
                            })
                        })
                    })
                })
            }
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
    $scope.db = PouchDB('STARS_TASKS');

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    document.body.addEventListener("online", function () {
        //   alert('calling sync function from task controller');
        syncTaskUpdates($scope, $http);
    }, true);

    if (jQuery.parseJSON(fsaApp.session.getSessionValue()) != null) {
        $("#spanUserName").text(fsaApp.session.getUserName());
    }
    fsaApp.setPageTitle("STARS");
    showLoading(true);

    if ($scope.online == true) {
        $http({
            method: "GET",
            url: "api/Tasks/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {
            $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        var taskDetails = {
                            _id: $routeParams.taskId + '-details',
                            TaskID: $routeParams.taskId,
                            UserID: $scope.UserName,
                            TaskDetails: data
                        }
                        $scope.db.put(taskDetails);
                    } else {
                        if (JSON.stringify(doc['TaskDetails']) != JSON.stringify(data)) {
                            var taskDetails = {
                                _id: $routeParams.taskId + '-details',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskDetails: data
                            }
                            $scope.db.remove(doc);
                            $scope.db.put(taskDetails);
                        }
                    }
                })
            })
            /*
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
            */
            loadMenuDetails();
            $scope.tskD = data;
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            $location.path("/tasks/rtnTsk/rtvTskDetMsg");
        });
    } else {//offline
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    showLoading(false);
                    $location.path("/tasks/rtnTsk/rtvTskDetMsg");
                } else {

                    loadMenuDetails();
                    $scope.tskD = doc['TaskDetails'];
                }
            })
        })
    }

    function loadMenuDetails() {
        if ($scope.online == true) {
            $http({
                method: "GET",
                url: "api/Tasks/" + $routeParams.taskId + "/GetSystemDown",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get($routeParams.taskId + '-systemDown', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskSystemDown = {
                                _id: $routeParams.taskId + '-systemDown',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskSystemDown: data
                            }
                            $scope.db.put(taskSystemDown);
                        } else {
                            if (JSON.stringify(doc['TaskSystemDown']) != JSON.stringify(data)) {
                                var taskSystemDown = {
                                    _id: $routeParams.taskId + '-systemDown',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskSystemDown: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskSystemDown);
                            }
                        }
                    })
                })
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
                $scope.lbrDbrf = 1;
            })
        } else {
            $scope.db.get($routeParams.taskId + '-systemDown', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        $scope.lbrDbrf = 1;
                    } else {
                        if (doc['TaskSystemDown'].srType.toString == "11002") {
                            if (doc['TaskSystemDown'].sysDown != "null" && doc['TaskSystemDown'].sysDown == "1") {        //confirm down should be required only when system is DOWN and SR type is General Repair
                                if (doc['TaskSystemDown'].cfmDown == 'Yes' || doc['TaskSystemDown'].cfmDown == 'No') {
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
                    }
                })
                showLoading(false);
            })
            //0; setting lbrDbrf flag to 1 because error means there is no system down specified for the task
        }
    }
    $scope.taskId = $routeParams.taskId;
    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "' ><img src='images/Three-Dots.png' height='28px' /></a>");
}

TaskDetailMenuController.$inject = ['$rootScope', '$scope', '$routeParams', '$http', '$location'];
fsaModule.controller('TaskDetailMenuController', TaskDetailMenuController);

function NotesController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    $scope.db = PouchDB('STARS_TASKS');

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    document.body.addEventListener("online", function () {
        //   alert('calling sync function from task controller');
        syncTaskUpdates($scope, $http);
    }, true);

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

//    $scope.showAddNote = function () {
//        $location.path("/tasks/" + $routeParams.taskId + "/note");
//    }
    $scope.showAddNote = function () {
        if ($scope.online == true) {
            $location.path("/tasks/" + $routeParams.taskId + "/note");
        } else {
            return;
        }
    }

    fsaApp.setPageTitle("STARS");
    $scope.statusOptions = [
    { name: 'Accept' },
    { name: 'Assigned' }
    ];
    $scope.statusOption = $scope.statusOptions[1];

    $scope.statusOptionsInPlanning = [
        { name: 'Accept' },
        { name: 'Auto In Planning' }
    ];
    $scope.statusOptionInPlanning = $scope.statusOptionsInPlanning[1];

    showLoading(true);
    if ($scope.online == true) {
        $('#offlineDiv').hide();        
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
            .success(function (dataNotes, status, headers, config) {
                showLoading(false);
                $scope.notes = dataNotes;
                $scope.showNotesCount = 0;
                $scope.displayNotes();

                $scope.db.get($routeParams.taskId + '-notes', function (err, docNotes) {         //response.rows[i].id, function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var TaskNotes = {
                                _id: $routeParams.taskId + '-notes',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskNotes: dataNotes
                            }
                            $scope.db.put(TaskNotes);
                        } else {
                            if (docNotes['TaskNotes'] != dataNotes) {
                                var TaskNotes = {
                                    _id: $routeParams.taskId + '-notes',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskNotes: dataNotes
                                }
                                $scope.db.remove(docNotes);
                                $scope.db.put(TaskNotes);
                            }
                        }
                    })
                })
                /*
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
                */
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
    }else{//offline

        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    $location.path("/tasks/rtnTsk/rtvTskDetMsg");
                } else {
                    $scope.tskD = doc['TaskDetails'];
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
                    checkStatusChangeOffline($scope, $routeParams, $http);
                    if ($scope.tskD.TSK.Status == "Debrief Complete") {
                        $location.path("/tasks/" + $routeParams.taskId);
                    }
                }
                $scope.db.get($routeParams.taskId + '-notes', function (err, docNotes) {         //response.rows[i].id, function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            showLoading(false);
                            //display error in a label
                            $('#nteErrMain').html("Error: " + data.ExceptionMessage);
                            showTimedElem('nteErrMain');
                        } else {
                            showLoading(false);
                            $scope.notes = docNotes['TaskNotes'];
                            $scope.TaskID = docNotes['TaskNotes']['ID'];
                            $scope.showNotesCount = 0;
                            $scope.displayNotes();
                        }
                    })
                })

            })
        })
        $('#offlineDiv').show();   $('#offlineDiv1').show();
    }

    $scope.displayNotes = function () {
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
        return
    }

    //Notes Controller
    $scope.acceptTask = function () {
        if ($scope.statusOption.name != 'Accept' && $scope.statusOptionInPlanning.name != 'Accept') {
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
    $scope.db = PouchDB('STARS_TASKS');

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }
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

    $scope.statusOptionsInPlanning = [
    { name: 'Accept' },
    { name: 'Auto In Planning' }
    ];
    $scope.statusOptionInPlanning = $scope.statusOptionsInPlanning[1];

    showLoading(true);
    if ($scope.online == true) {
        $('#offlineDiv').hide();       
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

                $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskDetails = {
                                _id: $routeParams.taskId + '-details',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskDetails: data
                            }
                            $scope.db.put(taskDetails);
                        } else {
                            if (JSON.stringify(doc['TaskDetails']) != JSON.stringify(data)) {
                                var taskDetails = {
                                    _id: $routeParams.taskId + '-details',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskDetails: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskDetails);
                            }
                        }
                    })
                })
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
        } else {//offline
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                } else {
                    showLoading(false);
                    $scope.tskD = doc['TaskDetails'];
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
                    checkStatusChangeOffline($scope, $routeParams, $http);
                    if ($scope.tskD.TSK.Status == "Debrief Complete") {
                        $location.path("/tasks/" + $routeParams.taskId);
                    }
                }
            })
        })

        $('#offlineDiv').show();       
    }
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

        if ($scope.online == true) {
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
                $scope.db.get($routeParams.taskId + '-notes', function (err, doc) {         //response.rows[i].id, function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var TaskNotes = {
                                _id: $routeParams.taskId + '-notes',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskNotes: data
                            }
                            $scope.db.put(TaskNotes);
                        } else {
                            if (JSON.stringify(doc['TaskNotes']) != JSON.stringify(data)) {
                                var TaskNotes = {
                                    _id: $routeParams.taskId + '-notes',
                                    TaskID: $routeParams.taskId,
                                    UserID: $scope.UserName,
                                    TaskNotes: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(TaskNotes);
                            }
                        }
                    })
                })
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
        } else {
            return;
        }
        }

    $scope.BackToNotes = function () {
        $location.path('/tasks/' + $routeParams.taskId + '/notes');
    }

    //Add Update Notes Controller
    $scope.acceptTask = function () {
        if ($scope.statusOption.name != 'Accept' && $scope.statusOptionInPlanning.name != 'Accept') {
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
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    if ($scope.online == true){       
        syncTaskUpdates($scope, $http);
    };

    fsaApp.showContextMenu("<a href = '#/tasks/" + $routeParams.taskId + "/taskDetailMenu'><img src='images/Three-Dots.png' height='28px' /></a>");
    showSignOutMenu();

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

    document.body.addEventListener("online", function () {
        //   alert('calling sync function from task controller');
        syncTaskUpdates($scope, $http);
    }, true);

    $scope.db = PouchDB('STARS_TASKS');
    $scope.dbPending = PouchDB('STARS_PENDING');

    if ($scope.online == true) {

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
            $scope.status = $scope.tskD.TSK.StatusID;
            $scope.statusName = $scope.tskD.TSK.Status;

            $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
                $rootScope.$apply(function () {
                    if (err) {
                        var taskDetails = {
                            _id: $routeParams.taskId + '-details',
                            TaskID: $routeParams.taskId,
                            UserID: $scope.UserName,
                            TaskDetails: data
                        }
                        $scope.db.put(taskDetails);
                    } else {
                        if (JSON.stringify(doc['TaskDetails']) != JSON.stringify(data)) {
                            var taskDetails = {
                                _id: $routeParams.taskId + '-details',
                                TaskID: $routeParams.taskId,
                                UserID: $scope.UserName,
                                TaskDetails: data
                            }
                            $scope.db.remove(doc);
                            $scope.db.put(taskDetails);
                        }
                    }
                })
            })
        })
        .error(function (data, status, headers, config) {
            if (status == 401) {
                $location.path("/login");
            } else {
                //display error in a label
                $location.path("/tasks/rtnTsk/rtvTskDetMsg");
            }
        });

        $scope.laborsArr = [];

        $http({
            method: "GET",
            url: "api/Labors/" + $routeParams.taskId,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: fsaApp.session.getAuthenticationHeader()
        })
        .success(function (data, status, headers, config) {

            $scope.laborsServer = data;
            $rootScope.savedLaborsServer = data;

            //           for (var lbr in $scope.laborsServer) {
            for (var i = 0; i < $scope.laborsServer.length; i++) {
                $scope.laborsArr.push($scope.laborsServer[i]);
            }
            //  update local data if it's different from the server data
            $scope.db.get($routeParams.taskId + '-labors', function (err, docLabors) {
                $scope.$apply(function () {
                    if (err) {
                        var taskLabors = {
                            _id: $routeParams.taskId + '-labors',
                            Labors: data
                        }
                        $scope.db.put(taskLabors);
                        showLoading(false);
                    } else {
                        if (JSON.stringify(docLabors['Labors']) != JSON.stringify(data)) {
                            var taskLabors = {
                                _id: $routeParams.taskId + '-labors',
                                Labors: data
                            }
                            $scope.db.remove(docLabors);
                            $scope.db.put(taskLabors);
                        }//if data is the same, no updates required
                    }
                })
            })

            $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                $scope.$apply(function () {
                    if (err) {//no pending labors exists
                        $scope.noOfLabors = 0;
                        $scope.labors = $scope.laborsArr;                       
                        if ($scope.labors.length > 0) {
                            //                    for (var lbr in $scope.labors) {
                            for (var i = 0; i < $scope.labors.length; i++) {
                                $scope.noOfLabors++;
                                if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                    $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                }
                                $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                    if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                        $scope.labors[i].Duration += '0';
                                    }
                                } else {
                                    $scope.labors[i].Duration += '.00';
                                }
                                if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                    $scope.labors[i].Duration += ' HR';
                                }
                            }
                        }
                    } else {//display pending data                      
                        ///==================
                        var laborLocal = docPending['LaborPendingList'];  //['LaborPending'];                          
                        $scope.pendingLen = laborLocal.length;

                        if (laborLocal instanceof Array) {
                            laborLocal.forEach(function (lbr) {
                                $scope.laborsArr.push(lbr['LaborLocal']);
                            })
                        } else {
                            $scope.laborsArr.push(laborLocal['LaborLocal']);
                        }

                        $scope.noOfLabors = 0;
                        $scope.labors = $scope.laborsArr;

                        if ($scope.labors.length > 0) {
                            //      for (var lbr in $scope.labors) {
                            for (var i = 0; i < $scope.labors.length; i++) {
                                $scope.noOfLabors++;
                                if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                    $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                }
                                $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                    if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                        $scope.labors[i].Duration += '0';
                                    }
                                } else {
                                    $scope.labors[i].Duration += '.00';
                                }
                                if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                    $scope.labors[i].Duration += ' HR';
                                }
                            }
                        }
                    }
                })
            })

            setTimeout($scope.RefreshLabors, 5000); //Labors controller call RefreshLabors if user has labors screen open
            showLoading(false);
        })
        .error(function (data, status, headers, config) {
            showLoading(false);
            if (status == 401) {
                fsaApp.session.removeSessionValue();
                $location.path("/login");
            } else {
                //display error in a label
                //$('#lbrErr').html("Error in retrieving Labors: " + data.ExceptionMessag);
                //showTimedElem('lbrErr');
            }
        })
    } else {//offline
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
            $rootScope.$apply(function () {
                if (err) {
                } else {
                    $scope.UserName = doc['UserID'];
                    $scope.tskD = doc['TaskDetails'];
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);                  
                    checkStatusChangeOffline($scope, $routeParams, $http);
                }
            })
        })

                $scope.laborArr = [];  
                $scope.savedLaborsArr = [];
        //   $scope.dbLabor.get($routeParams.taskId + '-labors', function (err, doc) {

        $scope.db.get($routeParams.taskId + '-labors', function (err, doc) {
            $scope.$apply(function () {
                if (err) {//error pulling labors from local db                
                    $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                        $scope.$apply(function () {
                            if (err) {//no pending labors exists
                                showLoading(false);
                            } else {//display pending labors only
                                $scope.labors = docPending['LaborPendingList'];
                                $scope.savedLaborsPending = docPending['LaborPendingList'];
                                $scope.noOfLabors = 0;
                                if ($scope.labors instanceof Array) {
                                    //        for (var lbr in $scope.labors) {
                                    for (var i = 0; i < $scope.labors.length; i++) {
                                        $scope.noOfLabors++;
                                        $scope.labors[i]['LaborLocal'].StartDate = $filter('date')(new Date($scope.labors[i]['LaborLocal'].StartDate), 'MM-dd-yyyy hh:mm a');
                                        // $scope.labors[lbr]['LaborLocal'].StartDate = new Date($scope.labors[lbr]['LaborLocal'].StartDate);
                                        if ($scope.labors[i]['LaborLocal'].Duration.indexOf('.') > 0) {
                                            if ($scope.labors[i]['LaborLocal'].Duration.split('.')[1].length == 1) {
                                                $scope.labors[i]['LaborLocal'].Duration += '0';
                                            }
                                        } else {
                                            $scope.labors[i]['LaborLocal'].Duration += '.00';
                                        }
                                        if ($scope.labors[i]['LaborLocal'].Duration.indexOf('HR') == 0) {
                                            $scope.labors[i]['LaborLocal'].Duration += ' HR';
                                        }
                                        $scope.labors[i]['LaborLocal'].SqlID = '';
                                    }
                                } else {
                                    $scope.noOfLabors++;
                                    $scope.labors['LaborLocal'].StartDate = $filter('date')(new Date($scope.labors['LaborLocal'].StartDate), 'MM-dd-yyyy hh:mm a');
                                    if ($scope.labors['LaborLocal'].Duration.indexOf('.') > 0) {
                                        if ($scope.labors['LaborLocal'].Duration.split('.')[1].length == 1) {
                                            $scope.labors['LaborLocal'].Duration += '0';
                                        }
                                    } else {
                                        $scope.labors['LaborLocal'].Duration += '.00';
                                    }
                                    if ($scope.labors['LaborLocal'].Duration.indexOf('HR') == 0) {
                                        $scope.labors['LaborLocal'].Duration += ' HR';
                                    }
                                    $scope.labors['LaborLocal'].SqlID = '';
                                }
                                return true;
                            }
                        })
                    })

                } else { //pouchdb has labors entries                     
                    $scope.laborsServer = doc['Labors'];
                    $scope.savedLaborsServer = doc['Labors'];

                    //       for (var lbr in $scope.laborsServer) {
                    for (var i = 0; i < $scope.laborsServer.length; i++) {
                        $scope.laborArr.push($scope.laborsServer[i]);
                        $scope.savedLaborsArr.push($scope.laborsServer[i]);
                    }
                    $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                        $scope.$apply(function () {
                            if (err) {
                                showLoading(false);
                            } else {
                                $scope.pendingLabors = docPending['LaborPendingList'];  //['LaborLocal'];                              
                                $scope.pendingSavedLabors = docPending['LaborPendingList'];   //['LaborLocal'];
                                if ($scope.pendingLabors instanceof Array) {
                                    for (var lbrp in $scope.pendingLabors) {
                                        $scope.pendingLabors[lbrp]['LaborLocal'].SqlID = '';
                                        $scope.laborArr.push($scope.pendingLabors[lbrp]['LaborLocal']);
                                        $scope.savedLaborsArr.push($scope.pendingLabors[lbrp]['LaborLocal']);
                                    }
                                } else {
                                    $scope.pendingLabors['LaborLocal'].SqlID = '';
                                    $scope.laborArr.push($scope.pendingLabors['LaborLocal']);
                                    $scope.savedLaborsArr.push($scope.pendingLabors['LaborLocal']);
                                }
                            }
                            $scope.labors = $scope.laborArr;
                            $scope.savedLabors = $scope.savedLaborsArr;
                            $scope.noOfLabors = 0;
                            //       for (var lbr in $scope.labors) {
                            for (var i = 0; i < $scope.labors.length; i++) {
                                $scope.noOfLabors++;
                                if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                    $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                }
                                $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                    if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                        $scope.labors[i].Duration += '0' + ' HR';
                                    } else {
                                        if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                            $scope.labors[i].Duration += ' HR';
                                        }
                                    }
                                } else {
                                    if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                        $scope.labors[i].Duration += '.00' + ' HR';
                                    } else {
                                        $scope.labors[i].Duration += '.00';
                                    }
                                }
                            }
                        })
                    })
                } // end of pouchdb has labors entries
                if ($location['$$url'].indexOf('labor') > 0) {
                    setTimeout($scope.RefreshLabors, 5000); //call RefreshLabors if user has labors screen open
                }
            })
        })
        showLoading(false);
    }
    //*****************

    $scope.RefreshLabors = function () {
        $scope.dbPending = PouchDB('STARS_PENDING');

        if (window.navigator.onLine) {
            $scope.online = true;
        } else {
            $scope.online = false;
        }

        if ($scope.online == true) {
            $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                $scope.$apply(function () {
                    if (err) {//no pending labors
                        showLoading(false);
                        $http({
                            method: "GET",
                            url: "api/Labors/" + $routeParams.taskId,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            $scope.labors = data;
                            $rootScope.savedLabors = data;
                            var laborArr = [];
                            $scope.laborsArr = [];
                            $scope.laborsServer = data;
                            $rootScope.savedLaborsServer = data;
                            //     for (var lbr in $scope.laborsServer) {
                            for (var i = 0; i < $scope.laborsServer.length; i++) {
                                $scope.laborsArr.push($scope.laborsServer[i]);
                            }

                            $scope.labors = $scope.laborsArr;
                            $scope.noOfLabors = 0;
                            //    for (var lbr in $scope.labors) {
                            for (var i = 0; i < $scope.labors.length; i++) {
                                $scope.noOfLabors++;
                                $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                    if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                        $scope.labors[i].Duration += '0';
                                    }
                                } else {
                                    $scope.labors[i].Duration += '.00';
                                }
                                if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                    $scope.labors[i].Duration += ' HR';
                                }
                            }
                            $scope.db.get($routeParams.taskId + '-labors', function (err, doc) {
                                $scope.$apply(function () {
                                    if (err) {//no labors in pouchdb
                                        var taskLabors = {
                                            _id: $routeParams.taskId + '-labors',
                                            Labors: data
                                        }
                                        $scope.db.put(taskLabors);
                                    } else {
                                        if (JSON.stringify(doc['Labors']) != JSON.stringify(data)) {//compare labors in pouchdb and on serve 
                                            var taskLabors = {
                                                _id: $routeParams.taskId + '-labors',
                                                Labors: data
                                            }
                                            $scope.db.remove(doc);
                                            $scope.db.put(taskLabors);
                                        } else {
                                        }
                                        return true;
                                    }
                                })
                            })
                        })
                        .error(function (data, status, headers, config) {
                            if ($location['$$url'].indexOf('labor') > 0) {
                                setTimeout($scope.RefreshLabors, 5000); //pouchdb has no pending labors and task doesn't have labors on server
                            }
                        })
                    } else {   //pouchdb has pending labors
                        $scope.laborsArr = [];
                        $http({
                            method: "GET",
                            url: "api/Labors/" + $routeParams.taskId,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: fsaApp.session.getAuthenticationHeader()
                        })
                        .success(function (data, status, headers, config) {
                            var laborArr = [];
                            $scope.laborsServer = data;
                            $rootScope.savedLaborsServer = data;

                            //   for (var lbr in $scope.laborsServer) {
                            for (var i = 0; i < $scope.laborsServer.length; i++) {
                                $scope.laborsArr.push($scope.laborsServer[i]);
                            }

                            var laborLocalList = docPending['LaborPendingList'];  //['LaborPending'];                          
                            $scope.pendingLen = laborLocalList.length;
                            if (laborLocalList instanceof Array) {
                                laborLocalList.forEach(function (lbr) {
                                    $scope.laborsArr.push(lbr['LaborLocal']);
                                })
                            } else {
                                $scope.laborsArr.push(laborLocalList['LaborLocal']);
                            }

                            $scope.labors = $scope.laborsArr;
                            $scope.noOfLabors = 0;
                            ///
                            //  for (var lbr in $scope.labors) {
                            for (var i = 0; i < $scope.labors.length; i++) {
                                $scope.noOfLabors++;
                                if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                    $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                }
                                $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                    if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                        $scope.labors[i].Duration += '0';
                                    }
                                } else {
                                    $scope.labors[i].Duration += '.00';
                                }
                                if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                    $scope.labors[i].Duration += ' HR';
                                }
                            }
                            $scope.db.get($routeParams.taskId + '-labors', function (err, doc) {
                                $scope.$apply(function () {
                                    if (err) {
                                        showLoading(false);
                                    } else {
                                        if (JSON.stringify(doc['Labors']) != JSON.stringify(data)) {
                                            var taskLabors = {
                                                _id: $routeParams.taskId + '-labors',
                                                Labors: data
                                            }
                                            $scope.db.remove(doc);
                                            $scope.db.put(taskLabors);
                                        } else {
                                            //  console.log('equal');
                                        }
                                        return true;
                                    }
                                })
                            })
                        })
                        .error(function (data, status, headers, config) {
                            if ($location['$$url'].indexOf('labor') > 0) {
                                setTimeout($scope.RefreshLabors, 5000);//error getting labors from server
                            }
                        })
                    }
                })
            })
        } else { //offline data
            $scope.laborArr = [];
            $scope.savedLaborsArr = [];          
            $scope.db.get($routeParams.taskId + '-labors', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                            $scope.$apply(function () {
                                if (err) {
                                    showLoading(false);
                                } else {
                                    $scope.labors = docPending['LaborPendingList'];     //['LaborLocal'];
                                    $scope.savedLaborsPending = docPending['LaborPendingList'];       //['LaborLocal'];
                                    $scope.noOfLabors = 0;
                                    if ($scope.labors instanceof Array) {
                                        //      for (var lbr in $scope.labors) {
                                        for (var i = 0; i < $scope.labors.length; i++) {
                                            $scope.noOfLabors++;
                                            $scope.labors[i]['LaborLocal'].StartDate = $filter('date')(new Date($scope.labors[i]['LaborLocal'].StartDate), 'MM-dd-yyyy hh:mm a');
                                            $scope.labors[i]['LaborLocal'].StartDate = new Date($scope.labors[i]['LaborLocal'].StartDate);
                                            if ($scope.labors[i]['LaborLocal'].Duration.indexOf('.') > 0) {
                                                if ($scope.labors[i]['LaborLocal'].Duration.split('.')[1].length == 1) {
                                                    $scope.labors[i]['LaborLocal'].Duration += '0';
                                                }
                                            } else {
                                                $scope.labors[i]['LaborLocal'].Duration += '.00';
                                            }
                                            if ($scope.labors[i]['LaborLocal'].Duration.indexOf('HR') == 0) {
                                                $scope.labors[i]['LaborLocal'].Duration += ' HR';
                                            }
                                        }
                                    } else {
                                        $scope.noOfLabors++;
                                        $scope.labors['LaborLocal'].StartDate = $filter('date')(new Date($scope.labors['LaborLocal'].StartDate), 'MM-dd-yyyy hh:mm a');
                                        if ($scope.labors['LaborLocal'].Duration.indexOf('.') > 0) {
                                            if ($scope.labors['LaborLocal'].Duration.split('.')[1].length == 1) {
                                                $scope.labors['LaborLocal'].Duration += '0';
                                            }
                                        } else {
                                            $scope.labors['LaborLocal'].Duration += '.00';
                                        }
                                        if ($scope.labors['LaborLocal'].Duration.indexOf('HR') <= 0) {
                                            $scope.labors['LaborLocal'].Duration += ' HR';
                                        }
                                    }
                                    return true;
                                }
                            })
                        })

                    } else {    //pouchdb has labors entries               

                        $scope.laborsServer = doc['Labors'];
                        $scope.savedLaborsServer = doc['Labors'];

                        //   for (var lbr in $scope.laborsServer) {
                        for (var i = 0; i < $scope.laborsServer.length; i++) {
                            $scope.laborArr.push($scope.laborsServer[i]);
                            $scope.savedLaborsArr.push($scope.laborsServer[i]);
                        }
                        $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                            $scope.$apply(function () {
                                if (err) {//display pouchdb labors only, no pending labors
                                    showLoading(false);
                                    $scope.noOfLabors = 0;
                                    //      for (var lbr in $scope.labors) {
                                    for (var i = 0; i < $scope.labors.length; i++) {
                                        $scope.noOfLabors++;
                                        if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                            $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                        }
                                        $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                        if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                            if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                                $scope.labors[i].Duration += '0' + ' HR';
                                            } else {
                                                if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                                    $scope.labors[i].Duration += ' HR';
                                                }
                                            }
                                        } else {
                                            $scope.labors[i].Duration += '.00' + ' HR';
                                        }
                                    }
                                } else {//display labors and pending labors
                                    $scope.pendingLabors = docPending['LaborPendingList'];  //['LaborLocal'];
                                    $scope.pendingSavedLabors = docPending['LaborPendingList'];   //['LaborLocal'];
                                    if ($scope.pendingLabors instanceof Array) {
                                        for (var lbrp in $scope.pendingLabors) {
                                            $scope.laborArr.push($scope.pendingLabors[lbrp]['LaborLocal']);
                                            $scope.savedLaborsArr.push($scope.pendingLabors[lbrp]['LaborLocal']);
                                        }
                                    } else {
                                        $scope.laborArr.push($scope.pendingLabors['LaborLocal']);
                                        $scope.savedLaborsArr.push($scope.pendingLabors['LaborLocal']);
                                    }
                                }
                                $scope.labors = $scope.laborArr;
                                $scope.savedLabors = $scope.savedLaborsArr;

                                $scope.noOfLabors = 0;
                                //      for (var lbr in $scope.labors) {
                                for (var i = 0; i < $scope.labors.length; i++) {
                                    $scope.noOfLabors++;
                                    if ($scope.labors[i].StartDate.indexOf('-') > 0) {
                                        $scope.labors[i].StartDate = $scope.labors[i].StartDate.replace("-", "/").replace("-", "/");
                                    }
                                    $scope.labors[i].StartDate = $filter('date')(new Date($scope.labors[i].StartDate), 'MM-dd-yyyy hh:mm a');
                                    if ($scope.labors[i].Duration.indexOf('.') > 0) {
                                        if ($scope.labors[i].Duration.split('.')[1].length == 1) {
                                            $scope.labors[i].Duration += '0' + ' HR';
                                        } else {
                                            if ($scope.labors[i].Duration.indexOf('HR') <= 0) {
                                                $scope.labors[i].Duration += ' HR';
                                            }
                                        }
                                    } else {
                                        $scope.labors[i].Duration += '.00' + ' HR';
                                    }
                                }
                            })
                        })
                    }
                })
            })
        }
        if ($location['$$url'].indexOf('labor') > 0) {
            setTimeout($scope.RefreshLabors, 5000);//calling RefreshLabors when working offline
        }
    }
}
LaborsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('LaborsController', LaborsController);

function AddUpdateLaborsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    $scope.db = PouchDB('STARS_TASKS');
    $scope.dbPending = PouchDB('STARS_PENDING');

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

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

    //***********************************
    if ($scope.online == false) {//offline      
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
            $rootScope.$apply(function () {
                if (err) {                  
                    showLoading(false);
                } else {                  
                    $scope.tskD = doc['TaskDetails']; //data;                 
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
                    checkStatusChangeOffline($scope, $routeParams, $http);
                    if ($scope.tskD.TSK.InstanceID != "") {
                        $scope.subComponent = $scope.tskD.TSK.InstanceID;
                    } else {
                        $scope.subComponent = $scope.tskD.TSK.SystemID;
                    }
                    $scope.subComponentName = $scope.tskD.TSK.InstanceDescription;

                    $scope.productName = $scope.tskD.TSK.ProductName;
                 //  console.log('*** $scope.tskD.TSK.SiteIncidentDate = ' + $scope.tskD.TSK.SiteIncidentDate + ' step 1 = ' + $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2]);
                    if ($scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5)[4] != ":") {                     
                        $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
                    } else {                    
                        $scope.tskD.TSK.incidentTempDate = $scope.tskD.TSK.SiteIncidentDate.split(" ")[0] + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[1].substr(0, 5) + " " + $scope.tskD.TSK.SiteIncidentDate.split(" ")[2];
                    }
                    $scope.isUpdateScreen = "";
                    $scope.db.get($scope.tskD.TSK.SRTypeID + '-serviceReasons', function (err, docReasons) {
                        $scope.$apply(function () {
                            if (err) {
                                showLoading(false);
                            } else {                            
                                $scope.reasonOptions = docReasons['ServiceReasons'];
                                if ($routeParams.laborId !== undefined && $routeParams.laborId != "") {
                                    $scope.isUpdateScreen = $routeParams.laborId;  //update existing labor
                                    $scope.parentID = 0;
                                    if ($rootScope.savedLabors !== undefined && $rootScope.savedLabors != "") {
                                        for (var i = 0; i < $rootScope.savedLabors.length; i++) {
                                            if ($rootScope.savedLabors[i].SqlID == "") {
                                                if ($rootScope.savedLabors[i].DebriefLineID != "") {//use DebriefLineID
                                                    if ($routeParams.laborId == $rootScope.savedLabors[i].DebriefLineID) {
                                                        selectedLabor = $rootScope.savedLabors[i];
                                                        break;
                                                    }
                                                } else {// DebriefLineID = '' and SqlID = '' and LocalID != '' use LocalID
                                                    if ($rootScope.savedLabors[i].LocalID != "") {
                                                        if ($routeParams.laborId == $rootScope.savedLabors[i].LocalID) {
                                                            selectedLabor = $rootScope.savedLabors[i];
                                                            break;
                                                        }
                                                    }
                                                }
                                            } else {//record save to sql
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
                                        $rootScope.reasonName = selectedLabor.LaborReasonName; ///added $rootScope.reasonName                
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
                                            if (selectedLabor.SqlID == "" && selectedLabor.LocalID != "") {
                                                $scope.parentID = selectedLabor.LocalID;
                                            }
                                        }
                                        if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {
                                            if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                                                $scope.db.get($scope.tskD.TSK.IncidentID + '-productItems', function (err, doc) {
                                                    $rootScope.$apply(function () {
                                                        if (err) {
                                                            showLoading(false);
                                                        } else {
                                                            $scope.prdItemsActual = doc['ProductItems'];
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
                                                                //    alert('iphone date 1 $scope.startDate = ' + $scope.startDate);
                                                            }
                                                            $scope.updLbrTms();
                                                            showLoading(false);
                                                        }
                                                    })
                                                });

                                            } else {//else - if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {                                             
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
                                                    //          alert('iphone date 2: $scope.startDate = ' + $scope.startDate);
                                                }                                               
                                                $scope.updLbrTms();
                                                showLoading(false);
                                            }//end of if/else ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                                        } else {//else of if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {
                                            //retrieve subcomponent name from dbLabor
                                            //    $scope.dbLabor.get($scope.tskD.TSK.IncidentID + '-subcomponent', function (err, doc) {
                                            $scope.db.get($scope.tskD.TSK.IncidentID + '-subcomponent', function (err, doc) {
                                                $rootScope.$apply(function () {
                                                    if (err) {
                                                        showLoading(false);
                                                    } else {                                                      
                                                        $scope.productName = doc['Subcomponent'].replace('"', '').replace('"', '');
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
                                                })
                                            });

                                        }//end of if/else ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') { 

                                    } else {//else of  if ($rootScope.savedLabors !== undefined && $rootScope.savedLabors != "") {                                      

                                        //   $scope.dbLabor.get($routeParams.taskId + '-labors', function (err, doc) { //response.rows[i].id, function (err, doc) {
                                        $scope.db.get($routeParams.taskId + '-labors', function (err, doc) { //response.rows[i].id, function (err, doc) {
                                            $scope.$apply(function () {
                                                if (err) {
                                                    $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                                                        $scope.$apply(function () {
                                                            if (err) {
                                                                showLoading(false);
                                                            } else {
                                                                $scope.noOfLabors = 0;
                                                                $scope.labors = docPending['LaborPendingList'];     //['LaborLocal'];
                                                                $scope.savedLaborsPending = doc['LaborPendingList'];       //['LaborLocal'];
                                                                $scope.noOfLabors = 0;
                                                                if ($scope.pendingLabors['LaborLocal'] instanceof Array) {
                                                                    for (var j = 0; j < $scope.pendingLabors['LaborLocal'].length; j++) {
                                                                        if ($routeParams.laborId == $scope.pendingLabors[j]['LaborLocal'].LocalID) {
                                                                            selectedLabor = $scope.pendingLabors[j]['LaborLocal'];
                                                                            break;
                                                                        }
                                                                    }
                                                                } else {
                                                                    if ($routeParams.laborId == $scope.pendingLabors['LaborLocal'].LocalID) {

                                                                        selectedLabor = $scope.pendingLabors['LaborLocal'];
                                                                    }
                                                                }
                                                                return true;
                                                            }
                                                        })
                                                    })
                                                } else {
                                                    $scope.noOfLabors = 0;
                                                    $scope.labors = doc['Labors']; //data;                                                   
                                                    $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                                                        $scope.$apply(function () {
                                                            if (err) {
                                                                for (var i = 0; i < $scope.labors.length; i++) {
                                                                    if ($routeParams.laborId == $scope.labors[i].DebriefLineID) {
                                                                        selectedLabor = $scope.labors[i];
                                                                        break;
                                                                    } else {// not oracle id
                                                                        if ($scope.labors[i].SqlID != "") {
                                                                            if ($routeParams.laborId == $scope.labors[i].SqlID) {
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
                                                                }
                                                                $scope.populateLaborData(selectedLabor);
                                                            } else {
                                                                $scope.pendingLabors = docPending['LaborPendingList'];  //['LaborLocal'];                                                    
                                                                for (var i = 0; i < $scope.labors.length; i++) {
                                                                    if ($routeParams.laborId == $scope.labors[i].DebriefLineID) {
                                                                        selectedLabor = $scope.labors[i];
                                                                        break;
                                                                    } else {// not oracle id
                                                                        if ($scope.labors[i].SqlID != "") {
                                                                            if ($routeParams.laborId == $scope.labors[i].SqlID) {
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
                                                                }

                                                                if (selectedLabor == undefined || selectedLabor == '') {                                                             
                                                                    if ($scope.pendingLabors instanceof Array) {
                                                                        for (var j = 0; j < $scope.pendingLabors.length; j++) {
                                                                            if ($routeParams.laborId == $scope.pendingLabors[j]['LaborLocal'].LocalID) {
                                                                                selectedLabor = $scope.pendingLabors[j]['LaborLocal'];
                                                                                break;
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if ($routeParams.laborId == $scope.pendingLabors['LaborLocal'].LocalID) {
                                                                            selectedLabor = $scope.pendingLabors['LaborLocal'];
                                                                        }
                                                                    }
                                                                }
                                                                $scope.populateLaborData(selectedLabor);

                                                            }//end of if/else ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {     
                                                        })
                                                    })
                                                }
                                            })
                                        });
                                    }// end  if/else ($rootScope.savedLabors !== undefined && $rootScope.savedLabors != "") {
                                } else {
                                    showLoading(false);
                                }
                            }
                        })
                    });
                }
            })
        });
        //end task details    
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
        
        $scope.populateLaborData = function (selectedLabor) {      
         //   console.log('$scope.populateLaborData: ' + $scope.populateLaborData);
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
                } else {
                    if (selectedLabor.LocalID != '') {
                        $scope.parentID = selectedLabor.LocalID;
                    }
                }
            }
            if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {
                if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                    //  $scope.dbLabor.get($scope.tskD.TSK.IncidentID + '-productItems', function (err, doc) {
                    $scope.db.get($scope.tskD.TSK.IncidentID + '-productItems', function (err, doc) {
                        $rootScope.$apply(function () {
                            if (err) {
                                showLoading(false);
                                if (status == 401) {
                                    //     $location.path("/login");
                                }
                                else {
                                    //display error in a label
                                    $('#addLbrErrMain').html("Error: " + data.ExceptionMessage);
                                    showTimedElem('addLbrErrMain');
                                }
                            } else {
                                $scope.prdItemsActual = doc['ProductItems'];
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
                                    //   alert('iphone date 4: $scope.startDate = ' + $scope.startDate);
                                }
                                $scope.updLbrTms();
                                showLoading(false);
                            }
                        })
                    });

                } else {// else of  if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
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
                        //             alert('iphone date 5: $scope.startDate = ' + $scope.startDate);
                    }
                    $scope.updLbrTms();
                    showLoading(false);
                } //end of  if/else ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {   
            } else {// else of if ($scope.tskD.TSK.installFlg != 'yes' || $scope.tskD.TSK.SystemID == '') {               
                //retrieve subcomponent name from dbLabor
                //   $scope.dbLabor.get($scope.tskD.TSK.IncidentID + '-subcomponent', function (err, doc) {
                $scope.db.get($scope.tskD.TSK.IncidentID + '-subcomponent', function (err, doc) {
                    $rootScope.$apply(function () {
                        if (err) {
                            showLoading(false);
                        } else {
                            $scope.productName = doc['Subcomponent'].replace('"', '').replace('"', '');
                            //  $scope.productName = data.replace('"', '').replace('"', '');
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
                     //           alert('iphone date 6: $scope.startDate = ' + $scope.startDate);
                            }
                            $scope.updLbrTms();
                            showLoading(false);
                        }
                    })
                })
            }
        }

        $scope.showPrdItms = function () {
            showLoading(true);
            if ($scope.prdItemsActual === undefined || $scope.prdItemsActual == '') {
                $scope.db.get($scope.tskD.TSK.IncidentID + '-productItems', function (err, doc) {
                    $rootScope.$apply(function () {
                        if (err) {
                            showLoading(false);
                        } else {
                            showLoading(false);
                            $scope.prdItemsActual = doc['ProductItems'];
                            var dataMap = {};
                            $scope.prdItemsActual.forEach(function (node) {
                                dataMap[node.instanceID] = node;
                            });
                            var tree = [];
                            $scope.prdItemsActual.forEach(function (node) {
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
                        }
                    })
                })
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
                    sDate = addTimes((new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " " + new Date().getHours() + ":" + new Date().getMinutes(), $scope.hours, $scope.minutes + '');
                } else {
                    sDate = addTimes($('#lbrStartDate').val().split('-')[1] + "-" + $('#lbrStartDate').val().split('-')[2] + "-" + $('#lbrStartDate').val().split('-')[0] + " " + convertTo24HrFormat($scope.startTime), $scope.hours, $scope.minutes + '');
                }
            } else {
                if ($('#lbrStDt').val() == '') { //chrome check
                    sDate = addTimes((new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " " + new Date().getHours() + ":" + new Date().getMinutes(), $scope.hours, $scope.minutes + '');
                } else {
                    sDate = addTimes($('#lbrStDt').val() + " " + convertTo24HrFormat($('#lbrStTm').val()), $scope.hours, $scope.minutes + '');
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
        ///isIPhone
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
                if ($scope.tskD.TSK.installFlg == 'yes' && $scope.tskD.TSK.SystemID != '') { } else {
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
            //   var laborArr = [];
            var localID = guid();
            //    var laborLocalArr = [];
            $scope.laborPenArrTmp = [];
            $scope.laborArrTmp = [];

            if ($scope.syncStatus == 'E ') {
                errStatusRowId = selectedLabor.SqlID;
            }

            $scope.laborClass = {
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
                LocalID: 'local-' + localID,
                LocalReason: $scope.reason,
                ErrStatusRowId: errStatusRowId
            };
            showLoading(true);

            if ($scope.reasonOptions instanceof Array) {
                for (var ind in $scope.reasonOptions) {
                    if ($scope.reasonOptions[ind]['ReasonCode'] == $scope.reason) {
                        $scope.reasonName = $scope.reasonOptions[ind]['ReasonName'];
                    }
                }
            } else {
                $scope.reasonName = $scope.reasonDetails['ReasonName'];
            }

            if ($scope.reason == 'TRAVEL_TO') {
                $scope.reasonName = 'Travel To';
            }
            if ($scope.reason == 'TRAVEL_FROM') {
                $scope.reasonName = 'Travel From';
            }

            var tmpStartDt = '';
            if (isIPhone()) {
                if ($scope.startDate === undefined || $scope.startDate == '') { //chrome check
                    tmpStartDt = (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear() + ' ' + new date().getTime();
                } else {
                    var tmptmp = new Number(new Date().getMonth($scope.startDate));
                    tmpStartDt = ((tmptmp + 1) + "/" + new Date().getDate($scope.startDate) + "/" + new Date().getFullYear($scope.startDate) + ' ' + $scope.startTime);
                }
            } else {
                var tmptmp = new Number(new Date().getMonth($scope.startDate));
                tmpStartDt = ((tmptmp + 1) + "/" + new Date().getDate($scope.startDate) + "/" + new Date().getFullYear($scope.startDate) + ' ' + $scope.startTime);
            }

            if ($scope.hours == '0' || $scope.hours == undefined) {
                tmpDurationHr = '0';
            } else {
                tmpDurationHr = $scope.hours;
            }
            var tmpDuration
            if ($scope.minutes == 0 || $scope.minutes == undefined) {
                tmpDurationMn = "00";
                // $scope.duration = tmpDurationHr + '.00';
            } else {
                tmpDurationMn = new Number($scope.minutes) / 60;
                tmpDuration = new Number(tmpDurationHr) + new Number(tmpDurationMn);
                tmpDuration = new String(tmpDuration);
                if (tmpDuration.indexOf('.') > 0) {
                    tmpDurationHr = tmpDuration.split('.')[0];
                    tmpDurationMn = tmpDuration.split('.')[1];
                    if (tmpDurationMn.length == 1) {
                        tmpDurationMn += '0';
                    }
                    if (tmpDurationMn.length >> 2) {
                        tmpDurationMn = tmpDurationMn.substr(1, 3);
                    }
                }
            }
            $scope.duration = tmpDurationHr + '.' + tmpDurationMn;
            $scope.laborClassPouch = {
                Reason: $scope.reasonName,
                LaborReasonMeaning: $scope.reason,
                SQLReasonName: $scope.reasonName,
                StartDate: tmpStartDt,
                Duration: $scope.duration,
                DebriefLineID: $scope.laborDebriefID,
                ParentID: $scope.parentID,
                SubComponent: $scope.subComponent,
                EndDate: '',
                SynchStatus: 'PL',
                UpsertType: '',
                SqlID: '',
                LocalID: 'local-' + localID,
                LocalReason: $scope.reason,
                Error: ''
            };

            $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                $scope.$apply(function () {
                    if (err) {
                        showLoading(false);
                        var addLaborEntry = {
                            LaborPending: $scope.laborClass,
                            LaborLocal: $scope.laborClassPouch
                        }
                        $scope.dbPending.put({
                            _id: $routeParams.taskId + '-laborPending',
                            LaborPendingList: addLaborEntry
                        });

                        $scope.laborPenArrTmp.push(addLaborEntry);
                        if (selectedLabor != '' && selectedLabor != undefined) {
                            if (selectedLabor.SqlID + selectedLabor.DebriefLineID != '') {
                                $scope.db.get($routeParams.taskId + '-labors', function (err, lbrDoc) {
                                    $rootScope.$apply(function () {
                                        if (err) {
                                            showLoading(false);
                                        } else {
                                            if (lbrDoc['Labors'] instanceof Array) {
                                                lbrDoc['Labors'].forEach(function (lbr) {
                                                    if ((selectedLabor.SqlID != '' && selectedLabor.SqlID == lbr.SqlID) || (selectedLabor.DebriefLineID != '' && selectedLabor.DebriefLineID == lbr.DebriefLineID)) {
                                                        //this is selected entry and it will be added to pending labors list
                                                    } else {
                                                        $scope.laborArrTmp.push(lbr);
                                                    }
                                                })
                                            }
                                            var taskLabors = {
                                                _id: $routeParams.taskId + '-labors',
                                                Labors: $scope.laborArrTmp
                                            }
                                            $scope.db.remove(lbrDoc);
                                            if ($scope.laborArrTmp.length > 0) {
                                                $scope.db.put(taskLabors);
                                            }
                                            $scope.showLabors(nextEntry);
                                        }
                                    })
                                })
                            }
                        } else {//selected labor is undefined. this is a new entry
                            var laborEntry = {
                                LaborPending: $scope.laborClass,
                                LaborLocal: $scope.laborClassPouch
                            }
                            $scope.dbPending.put({
                                _id: $routeParams.taskId + '-laborPending',
                                LaborPendingList: laborEntry
                            });
                            $scope.laborPenArrTmp.push(laborEntry);
                            $scope.showLabors(nextEntry);
                        }
                    } else {  //success: not error                    
                        $scope.laborPendingList = docPending['LaborPendingList'];       //['LaborPending'];           //new pending entry       
                        var laborEntry = {
                            LaborPending: $scope.laborClass,
                            LaborLocal: $scope.laborClassPouch
                        }
                        //load existing labor to array
                        //    var laborEntry;
                        var updateFlg = false;
                        if (selectedLabor != '' && selectedLabor != undefined) {// update record
                            if (selectedLabor.DebriefLineID + selectedLabor.SqlID == '') {//update local entry                       
                                if ($scope.laborPendingList instanceof Array) {
                                    for (var ind in $scope.laborPendingList) {
                                        //find selected labor in labor pending list  
                                        if (selectedLabor.LocalID != $scope.laborPendingList[ind]['LaborLocal'].LocalID) {
                                            //add not modified existing pending local labors to array                                               
                                            $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                        }
                                    }
                                } else {//not array
                                }//end of array checking 
                                $scope.laborPenArrTmp.push(laborEntry);
                                $scope.dbPending.remove(docPending);
                                $scope.dbPending.put({
                                    _id: $routeParams.taskId + '-laborPending',
                                    LaborPendingList: $scope.laborPenArrTmp
                                });
                            } else {//update server entry
                                $scope.db.get($routeParams.taskId + '-labors', function (err, lbrDoc) {
                                    $rootScope.$apply(function () {
                                        if (err) {
                                            showLoading(false);
                                        } else {
                                            if (lbrDoc['Labors'] instanceof Array) {
                                                lbrDoc['Labors'].forEach(function (lbr) {
                                                    if ((selectedLabor.SqlID != '' && selectedLabor.SqlID == lbr.SqlID) || (selectedLabor.DebriefLineID != '' && selectedLabor.DebriefLineID == lbr.DebriefLineID)) {
                                                        //this is selected entry and it will be added to pending labors list
                                                    } else {
                                                        $scope.laborArrTmp.push(lbr);
                                                    }
                                                })
                                            }
                                            var taskLabors = {
                                                _id: $routeParams.taskId + '-labors',
                                                Labors: $scope.laborArrTmp
                                            }
                                            $scope.db.remove(lbrDoc);

                                            if ($scope.laborArrTmp.length > 0) {
                                                $scope.db.put(taskLabors);
                                            }
                                            //add new record local labor list
                                            if ($scope.laborPendingList instanceof Array) {
                                                for (var ind in $scope.laborPendingList) {
                                                    //add all existing pending local labors to array                                               
                                                    $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                                }
                                            } else {//not array                                       
                                                $scope.laborPenArrTmp.push($scope.laborPendingList);
                                            }//end of array checking 
                                            $scope.laborPenArrTmp.push(laborEntry);
                                            $scope.dbPending.remove(docPending);
                                            $scope.dbPending.put({
                                                _id: $routeParams.taskId + '-laborPending',
                                                LaborPendingList: $scope.laborPenArrTmp
                                            });
                                        }
                                    })
                                })
                            }
                        } else {//selected entry is undefined, so add a new entry                       
                            if ($scope.laborPendingList instanceof Array) {
                                for (var ind in $scope.laborPendingList) {
                                    $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                }
                            } else {
                                $scope.laborPenArrTmp.push($scope.laborPendingList);
                            }
                            laborEntry = {
                                LaborPending: $scope.laborClass,
                                LaborLocal: $scope.laborClassPouch
                            }
                            $scope.laborPenArrTmp.push(laborEntry);
                            var laborLocalUpd = {
                                _id: $routeParams.taskId + '-laborPending',
                                LaborPendingList: $scope.laborPenArrTmp          //laborArr
                            };
                            //     $scope.dbLabor.remove(docPending);
                            //     $scope.dbLabor.put(laborLocalUpd);
                            $scope.dbPending.remove(docPending);
                            $scope.dbPending.put(laborLocalUpd);
                            //        }  
                            //display successfull message;
                            showLoading(false);

                        }
                        $scope.showLabors(nextEntry);
                        //  $scope.RefreshLaborsPage;
                    }//end success
                    //  syncTaskUpdates($scope, $http);
                })////$scope.$apply(function () {
            })////$scope.dbLabor.get($routeParams.taskId + '-laborPending', function (err, docPending) {
        }
 
        $scope.showLabors = function (nextEntry) {
            //  setTimeout($scope.showLabors, 1000);
            if (nextEntry) {
                $scope.reason = "";
                $scope.startDate = $scope.endDate;
                $scope.startTime = $scope.endTime;
                $scope.hours = "0";
                $scope.minutes = "00";
                $scope.endDate = $scope.startDate;
                $scope.endTime = $scope.startTime;
            } else {////add loading labors list

                if ($scope.laborDebriefID != "" || $scope.parentID != 0) {
                    return $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/udLbrMsg");
                } else {
                    return $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/adLbrMsg");
                }
            }
            showLoading(false);
        }
 
        $scope.removeLaborFromPouchDb = function (selectedLabor) {
            $scope.db = PouchDB('STARS_TASKS');
            $scope.db.get($routeParams.taskId + '-labors', function (err, doc) {
                $scope.$apply(function () {
                    if (err) {
                        showLoading(false);
                    } else {
                        if (doc['Labors'] instanceof Array) {
                            doc['Labors'].forEach(function (lbr) {
                                if (selectedLabor.DebriefLineID == lbr.DebriefLineID || (selectedLabor.SqlID == lbr.SqlID && selectedLabor.SqlID != '')) {
                                    // $scope.dbLabor.remove(lbr);
                                    $scope.db.remove(lbr);
                                }
                            })
                        } else {
                            if (selectedLabor.DebriefLineID == doc['Labors'].DebriefLineID || selectedLabor.SqlID == doc['Labors'].SqlID) {
                                $scope.db.remove(doc);
                            }
                        }
                        return true;
                    }
                })
            })
        }

        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        function guid() {
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        }
    ////    $scope.addLabor
        /*
        $scope.BackToLabors = function () {
            $location.path('/tasks/' + $routeParams.taskId + '/labors');
        }
        */
        //***********************************
    } else {  /// online ************************
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
                // $scope.reasonOptions = data;
                if ($scope.tskD.TSK.SRTypeID != 11011) {
                    var reasonsArr = [];
                    data.forEach(function (res) {
                        reasonsArr.push(res);
                    })
                    var resCode = {
                        ReasonCode: "TRAVEL_TO",
                        ReasonName: "Travel To",
                        SRTypeID: $scope.tskD.TSK.SRTypeID,
                        LookupCode: ""
                    }
                    reasonsArr.push(resCode);
                    resCode = {
                        ReasonCode: "TRAVEL_FROM",
                        ReasonName: "Travel From",
                        SRTypeID: $scope.tskD.TSK.SRTypeID,
                        LookupCode: ""
                    }
                    reasonsArr.push(resCode);
                    $scope.reasonOptions = reasonsArr;
                } else {
                    $scope.reasonOptions = data;
                }
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
//    }// end if statement checking online/offline mode
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
        
            if ($scope.online == true) {
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
            } else {// if ($scope.online == false) {

                $scope.laborPenArrTmp = [];
                $scope.laborsArrTmp = [];

                $scope.dbPending.get($routeParams.taskId + '-laborPending', function (err, docPending) {
                    $scope.$apply(function () {
                        if (err) {                          
                            showLoading(false);
                            var addLaborEntry = {
                                LaborPending: $scope.laborClass,
                                LaborLocal: $scope.laborClassPouch
                            }
                            $scope.dbPending.put({
                                _id: $routeParams.taskId + '-laborPending',
                                LaborPendingList: addLaborEntry
                            });

                            $scope.laborPenArrTmp.push(addLaborEntry);
                            if (selectedLabor != '' && selectedLabor != undefined) {
                                if (selectedLabor.SqlID + selectedLabor.DebriefLineID != '') {
                                    $scope.db.get($routeParams.taskId + '-labors', function (err, lbrDoc) {
                                        $rootScope.$apply(function () {
                                            if (err) {                                            
                                                showLoading(false);
                                            } else {                                             
                                                if (lbrDoc['Labors'] instanceof Array) {
                                                    lbrDoc['Labors'].forEach(function (lbr) {
                                                        if ((selectedLabor.SqlID != '' && selectedLabor.SqlID == lbr.SqlID) || (selectedLabor.DebriefLineID != '' && selectedLabor.DebriefLineID == lbr.DebriefLineID)) {
                                                            //this is selected entry and it will be added to pending labors list
                                                        } else {
                                                            $scope.laborsArrTmp.push(lbr);
                                                        }
                                                    })
                                                }
                                                var taskLabors = {
                                                    _id: $routeParams.taskId + '-labors',
                                                    Labors: $scope.laborsArrTmp
                                                }
                                                $scope.db.remove(lbrDoc);
                                                if ($scope.laborsArrTmp.length > 0) {
                                                    $scope.db.put(taskLabors);
                                                }
                                                $scope.showLabors(nextEntry);
                                            }
                                        })
                                    })
                                }
                            } else {//selected labor is undefined. this is a new entry                              
                                var laborEntry = {
                                    LaborPending: $scope.laborClass,
                                    LaborLocal: $scope.laborClassPouch
                                }
                                $scope.dbPending.put({
                                    _id: $routeParams.taskId + '-laborPending',
                                    LaborPendingList: laborEntry
                                });
                                $scope.laborPenArrTmp.push(laborEntry);
                                $scope.showLabors(nextEntry);
                            }
                        } else {  //success: not error                           
                            $scope.laborPendingList = docPending['LaborPendingList'];       //['LaborPending'];           //new pending entry       
                            var laborEntry = {
                                LaborPending: $scope.laborClass,
                                LaborLocal: $scope.laborClassPouch
                            }
                            //load existing labor to array
                            //    var laborEntry;
                            var updateFlg = false;
                            if (selectedLabor != '' && selectedLabor != undefined) {// update record
                                if (selectedLabor.DebriefLineID + selectedLabor.SqlID == '') {//update local entry                       
                                    if ($scope.laborPendingList instanceof Array) {
                                        for (var ind in $scope.laborPendingList) {
                                            //find selected labor in labor pending list  
                                            if (selectedLabor.LocalID != $scope.laborPendingList[ind]['LaborLocal'].LocalID) {
                                                //add not modified existing pending local labors to array                                               
                                                $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                            }
                                        }
                                    } else {//not array
                                    }//end of array checking 
                                    $scope.laborPenArrTmp.push(laborEntry);
                                    $scope.dbPending.remove(docPending);
                                    $scope.dbPending.put({
                                        _id: $routeParams.taskId + '-laborPending',
                                        LaborPendingList: $scope.laborPenArrTmp
                                    });
                                } else {//update server entry
                                    $scope.db.get($routeParams.taskId + '-labors', function (err, lbrDoc) {
                                        $rootScope.$apply(function () {
                                            if (err) {
                                                showLoading(false);
                                            } else {
                                                if (lbrDoc['Labors'] instanceof Array) {
                                                    lbrDoc['Labors'].forEach(function (lbr) {
                                                        if ((selectedLabor.SqlID != '' && selectedLabor.SqlID == lbr.SqlID) || (selectedLabor.DebriefLineID != '' && selectedLabor.DebriefLineID == lbr.DebriefLineID)) {
                                                            //this is selected entry and it will be added to pending labors list
                                                        } else {
                                                            $scope.laborsArrTmp.push(lbr);
                                                        }
                                                    })
                                                }
                                                var taskLabors = {
                                                    _id: $routeParams.taskId + '-labors',
                                                    Labors: $scope.laborsArrTmp
                                                }
                                                $scope.db.remove(lbrDoc);

                                                if ($scope.laborsArrTmp.length > 0) {
                                                    $scope.db.put(taskLabors);
                                                }
                                                //add new record local labor list
                                                if ($scope.laborPendingList instanceof Array) {
                                                    for (var ind in $scope.laborPendingList) {
                                                        //add all existing pending local labors to array                                               
                                                        $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                                    }
                                                } else {//not array                                       
                                                    $scope.laborPenArrTmp.push($scope.laborPendingList);
                                                }//end of array checking 
                                                $scope.laborPenArrTmp.push(laborEntry);
                                                $scope.dbPending.remove(docPending);
                                                $scope.dbPending.put({
                                                    _id: $routeParams.taskId + '-laborPending',
                                                    LaborPendingList: $scope.laborPenArrTmp
                                                });
                                            }
                                        })
                                    })
                                }
                            } else {//selected entry is undefined, so add a new entry                                
                                if ($scope.laborPendingList instanceof Array) {
                                    for (var ind in $scope.laborPendingList) {
                                        $scope.laborPenArrTmp.push($scope.laborPendingList[ind]);
                                    }
                                } else {
                                    $scope.laborPenArrTmp.push($scope.laborPendingList);
                                }
                                laborEntry = {
                                    LaborPending: $scope.laborClass,
                                    LaborLocal: $scope.laborClassPouch
                                }
                                $scope.laborPenArrTmp.push(laborEntry);
                                var laborLocalUpd = {
                                    _id: $routeParams.taskId + '-laborPending',
                                    LaborPendingList: $scope.laborPenArrTmp          //laborArr
                                };
                                //     $scope.dbLabor.remove(docPending);
                                //     $scope.dbLabor.put(laborLocalUpd);
                                $scope.dbPending.remove(docPending);
                                $scope.dbPending.put(laborLocalUpd);
                                //        }  
                                //display successfull message;
                                showLoading(false);

                            }                          
                            $scope.showLabors(nextEntry);
                            //  $scope.RefreshLaborsPage;
                        }//end success
                        //  syncTaskUpdates($scope, $http);
                    })////$scope.$apply(function () {
                })////$scope.dbLabor.get($routeParams.taskId + '-laborPending', function (err, docPending) {
            }
        }

        $scope.showLabors = function (nextEntry) {
            //  setTimeout($scope.showLabors, 1000);
            if (nextEntry) {
                $scope.reason = "";
                $scope.startDate = $scope.endDate;
                $scope.startTime = $scope.endTime;
                $scope.hours = "0";
                $scope.minutes = "00";
                $scope.endDate = $scope.startDate;
                $scope.endTime = $scope.startTime;
            } else {////add loading labors list

                if ($scope.laborDebriefID != "" || $scope.parentID != 0) {
                    return $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/udLbrMsg");
                } else {
                    return $location.path("/tasks/" + $routeParams.taskId + "/labors/rtnLbr/adLbrMsg");
                }
            }
            showLoading(false);
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
}
    $scope.BackToLabors = function () {
        $location.path('/tasks/' + $routeParams.taskId + '/labors');
    }
}
AddUpdateLaborsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('AddUpdateLaborsController', AddUpdateLaborsController);

function FDAsController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    $scope.db = PouchDB('STARS_TASKS');
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
    if ($scope.online == true) {
        $('#offlineDiv').hide();
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
    } else {//offline
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
            $rootScope.$apply(function () {
                if (err) {
                    showLoading(false);
                } else {
                    $scope.tskD = doc['TaskDetails'];
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
                    checkStatusChangeOffline($scope, $routeParams, $http);
                    if ($scope.tskD.TSK.Status == "Debrief Complete") {
                        $location.path("/tasks/" + $routeParams.taskId);
                    }
                }
            })
        });
        showLoading(true);
        $scope.db.get($routeParams.taskId + '-fdaQuestions', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
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
                } else {
                    showLoading(false);
                    if (doc['TaskFDAQuestions'][0] === undefined || doc['TaskFDAQuestions'][0] == "") {
                        $scope.fdaQ1 = "No";
                    } else {
                        $scope.fdaQ1 = doc['TaskFDAQuestions'][0];
                    }
                    if (doc['TaskFDAQuestions'][1] === undefined || doc['TaskFDAQuestions'][1] == "") {
                        $scope.fdaQ2 = "No";
                    } else {
                        $scope.fdaQ2 = doc['TaskFDAQuestions'][1];
                    }
                    if (doc['TaskFDAQuestions'][2] === undefined || doc['TaskFDAQuestions'][2] == "") {
                        $scope.fdaQ3 = "No";
                    } else {
                        $scope.fdaQ3 = doc['TaskFDAQuestions'][2];
                    }
                    if (doc['TaskFDAQuestions'][3] === undefined || doc['TaskFDAQuestions'][3] == "") {
                        $scope.fdaQ4 = "No";
                    } else {
                        $scope.fdaQ4 = doc['TaskFDAQuestions'][3];
                    }
                    if (doc['TaskFDAQuestions'][4] === undefined || doc['TaskFDAQuestions'][4] == "") {
                        $scope.fdaQ5 = "No";
                    } else {
                        $scope.fdaQ5 = doc['TaskFDAQuestions'][4];
                    }

                }
            })
        });
        $('#offlineDiv').show();
    }
    $scope.updateFDA = function () {
        if ($scope.online == true) {
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
}
FDAsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('FDAsController', FDAsController);
/*Controllers End*/

function SearchTasksController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    showAnchorLogo(false);
    showSignOutMenu();

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    if ($scope.online == true) {
        $('#offlineDiv').hide();
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
    }
SearchTasksController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', '$http', '$filter'];
fsaModule.controller('SearchTasksController', SearchTasksController);

function InventoryController($rootScope, $scope, $location, $routeParams, $http, $filter) {
    disableToolTip();
    $scope.db = PouchDB('STARS_TASKS');

    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

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
            if ($scope.online == true) {
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
            } else {//offline
                //display successfull message; 
                $scope.db.get('-savedLocations', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            showLoading(false);
                            if (status == 401) {
                                $location.path("/login");
                            }
                            else {
                                //display error in a label
                                $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                                showTimedElem('inventoryErrMsgMain');
                            }
                        } else {
                            $scope.savedLocationsList = doc['SavedLocations'];
                            if ($routeParams.savedLocationID !== undefined && $routeParams.savedLocationID != "" && $routeParams.savedLocationID != null) {
                                showLoading(true);
                                $scope.savedLocations = $routeParams.savedLocationID;
                                //display successfull message; 
                                $scope.db.get($scope.savedLocations + '-inventory', function (err, doc) {
                                    $scope.$apply(function () {
                                        if (err) {
                                            showLoading(false);
                                            if (status == 401) {
                                                $location.path("/login");
                                            }
                                            else {
                                                //display error in a label
                                                $('#inventoryErrMsgMain').html("Error: " + data.ExceptionMessage);
                                                showTimedElem('inventoryErrMsgMain');
                                            }
                                        } else {
                                            $scope.inventories = doc['Inventory'];     //data;
                                            if ($scope.inventories.length > 0) {
                                                $scope.noOfInventories = $scope.inventories.length;
                                            }
                                            showLoading(false);
                                        }
                                    })
                                });
                            } else {
                                showLoading(false);
                            }
                        }
                    })
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
    $scope.db = PouchDB('STARS_TASKS');
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }
    if ($scope.online == true) {

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
    } else {
        $scope.db.get($routeParams.savedLocationID + '-' + $routeParams.inventoryID + '-inventoryItems', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    showLoading(false);
                } else {
                    $scope.inventoryDetail = doc['InventoryItems'];         //data;
                    showLoading(false);
                }
            })
        });
    }

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
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }
    if ($scope.online == true) {
        $('#offlineDiv').hide();
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
    } else {
        $('.table-modified-btm-brdr').hide();
        $('.al-btn-td').hide();
        $('#offlineDiv').show();
    }

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
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    if ($scope.online == true) {
        $('#offlineDiv').hide();
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
    } else {

        $scope.db.get('-whereabout', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    showLoading(false);
                } else {
                    $scope.whereAboutsType = doc.Whereabout.whereAboutsType;        //data.whereAboutsType;
                    $scope.unavailableDate = doc.Whereabout.unavailableDate.replace("/", "-").replace("/", "-");
                    $scope.startTime = doc.Whereabout.startTime;
                    if ($scope.startTime == "") {
                        $scope.startTime = new Date().getHours() + ":" + new Date().getMinutes();
                    }
                    if ($scope.startTime.split(" ")[0].length == 4) {
                        $scope.startTime = "0" + $scope.startTime;
                    }
                    $scope.startTime = convertToAmPm($scope.startTime);
                    $scope.returnDate = doc.Whereabout.returnDate.replace("/", "-").replace("/", "-");
                    $scope.returnTime = doc.Whereabout.returnTime;
                    if ($scope.returnTime == "") {
                        $scope.returnTime = new Date().getHours() + ":" + new Date().getMinutes();
                    }
                    if ($scope.returnTime.split(" ")[0].length == 4) {
                        $scope.returnTime = "0" + $scope.returnTime;
                    }
                    $scope.returnTime = convertToAmPm($scope.returnTime);
                    $scope.lastUpdate = doc.Whereabout.lastUpdate.replace("/", "-").replace("/", "-");
                    $scope.lastTime = doc.Whereabout.lastTime;
                    if ($scope.lastTime.split(" ")[0].length == 4) {
                        $scope.lastTime = "0" + $scope.lastTime;
                    }
                    $scope.whereAbouts = doc.Whereabout.whereAbouts;   //data.whereAbouts;
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
                    $('.al-btn-td').hide();
                    $('#offlineDiv').show();
                }
            })
        });
    }

    $scope.SaveWhereAbouts = function () {
         if (isIPhone()) {
            if ($('#waUnavailableDate').val() != "") {
                $scope.unavailableDate = $('#waUnavailableDate').val().split('-')[1] + "-" + $('#waUnavailableDate').val().split('-')[2] + "-" + $('#waUnavailableDate').val().split('-')[0];
            }else{
                $('#waErrMsgMain').html('Unavailable date cannot be empty.');
                showTimedElem('waErrMsgMain');
            return;
        }
            if ($('#waReturnDate').val() != "") {
                $scope.returnDate = $('#waReturnDate').val().split('-')[1] + "-" + $('#waReturnDate').val().split('-')[2] + "-" + $('#waReturnDate').val().split('-')[0];
            }
        } else {
            $scope.unavailableDate = $('#unavailableStDt').val();
            $scope.returnDate = $('#waRtDt').val();
        }      
        if ($scope.whereAboutsType == "" || $scope.whereAboutsType == null || $scope.whereAboutsType == undefined) {          
            $('#waErrMsgMain').html('Whereabouts type cannot be empty.');
            showTimedElem('waErrMsgMain');
            return;
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
            whereAbouts: $scope.whereAbouts,
            saveAction: 'Set'
        };
        showLoading(true);
        $http({
            method: "POST",
            url: "api/updateWhereAbout",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(WAClass),
         //   action: "Set",
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

    $scope.ClearWhereAbouts = function () {
        var WAClass = {};
        $scope.whereAboutsType = '';
        $scope.unavailableDate = '';
        $scope.startTime = '';
     //   convertTo24HrFormat($scope.startTime) 
        $scope.returnDate = '';
        $scope.returnTime = '';
      //  returnTime: convertTo24HrFormat($scope.returnTime),
        $scope.lastUpdate = '';
        $scope.lastTime = '';
        $scope.whereAbouts = '';

        WAClass = {
            whereAboutsType: $scope.whereAboutsType,
            unavailableDate: $scope.unavailableDate,
            //    startTime: convertTo24HrFormat($scope.startTime),
            startTime: $scope.startTime,
            returnDate: $scope.returnDate,
        //    returnTime: convertTo24HrFormat($scope.returnTime),
            returnTime: $scope.returnTime,
            lastUpdate: $scope.lastUpdate,
            lastTime: $scope.lastTime,
            whereAbouts: $scope.whereAbouts,
            saveAction: 'Clear'
        };

        showLoading(true);
        $http({
            method: "POST",
            url: "api/updateWhereAbout",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(WAClass),
        //    action: "Clear",
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

    $scope.db = PouchDB('STARS_TASKS');
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
    if (window.navigator.onLine) {
        $scope.online = true;
    } else {
        $scope.online = false;
    }

    document.body.addEventListener("online", function () {
        //   alert('calling sync function from task controller');
        syncTaskUpdates($scope, $http);
    }, true);

    if ($scope.online == true) {
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
		if ($scope.tskD.TSK.SRTypeID == '11010') {
			$scope.currentMaterialDiv = 0;
			$('#div-inventory').hide();
			$('#div-product-items').hide();
			$('#itemSelection').hide();
			$('#exchangeMaterialConfirmation').hide();
			$('#NonSerializedItemsDiv').hide();
			$('#materialConfirmScreen').hide();
			$('#TaskDetail').hide();
			$('#supportDiv').show();
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
    } else {//offline mode
        $scope.db.get($routeParams.taskId + '-details', function (err, doc) {
            $rootScope.$apply(function () {
                if (err) {
                    showLoading(false);
                } else {
                    $scope.tskD = doc.TaskDetails;         //data     ;
                    $scope.tskD.TSK.CustomerName = ProperCase($scope.tskD.TSK.CustomerName);
                    checkStatusChangeOffline($scope, $routeParams, $http);
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
                    if ($scope.tskD.TSK.SRTypeID == '11010') {
                        $scope.currentMaterialDiv = 0;
                        $('#div-inventory').hide();
                        $('#div-product-items').hide();
                        $('#itemSelection').hide();
                        $('#exchangeMaterialConfirmation').hide();
                        $('#NonSerializedItemsDiv').hide();
                        $('#materialConfirmScreen').hide();
                        $('#TaskDetail').hide();
                        $('#supportDiv').show();
                    }
                    if ($scope.tskD.TSK.Status == "Debrief Complete") {
                        $location.path("/tasks/" + $routeParams.taskId);
                    }

                    $scope.db.get($routeParams.taskId + '-materials', function (err, doc) {
                        $rootScope.$apply(function () {
                            if (err) {
                                showLoading(false);
                            } else {
                                $scope.installedMaterials = doc.TaskMaterials[0];
                                $scope.removedMaterials = doc.TaskMaterials[1];
                                $scope.exchangedMaterials = doc.TaskMaterials[2];
                                showLoading(false);
                            }
                        })
                    })
                }
            })
        });
        //$scope.currentMaterialDiv = 0;
        //$('.td-tskd-left-img').hide();
        $('#offlineDiv').show();
    }

    $scope.updateMaterials = function (screenType) {
        if ($scope.online == true) {
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
        } else {
            //offline mode
        }
    }
    $scope.partQuantity = "1";

    $scope.showMaterials = function (typeOfLogic) {
        if ($scope.online == true) {
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
        } else {
            //offline mode
            $('#offlineDiv').show();
            $scope.BackToMaterials;
        }
    }

    $scope.SelectNonSerializedItem = function (itemKey) {
        if ($scope.online == true) {
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
        } else {

        }
    }

    $scope.selectMaterialItem = function (itemKey) {
        if ($scope.online == true) {
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
                     //   $scope.installParentPartNumber = $scope.prdItemsActual[i].instanceID;
                        $scope.installParentPartNumber = $scope.removeParentPartNumber;
                       // $scope.installParentPartName = $scope.prdItemsActual[i].description;
                        $scope.installParentPartName = $scope.removeParentPartName;
                        $scope.installPartNumber = $scope.prdItemsActual[i].partNumber;
                        $scope.installSerialNumber = $scope.prdItemsActual[i].serialNumber;
                        $scope.installPartDescription = $scope.prdItemsActual[i].description;
                        $scope.installPartNumberID = $scope.prdItemsActual[i].inventoryItemID;
                        $scope.installRemoveProductId = $scope.removeParentPartNumber;                       
                    }
                } else {
                    $scope.parentPartNumber = $scope.prdItemsActual[i].instanceID;
                    $scope.partNumber = $scope.prdItemsActual[i].partNumber;
                    $scope.serialNumber = $scope.prdItemsActual[i].serialNumber;
                    $scope.partDescription = $scope.prdItemsActual[i].description;
                    $scope.inventoryItemID = $scope.prdItemsActual[i].inventoryItemID;
                    $scope.parentPartName = $scope.prdItemsActual[i].description;
                    $scope.parentInstanceID = $scope.prdItemsActual[i].parentInstanceID;
                    $scope.instanceID = $scope.prdItemsActual[i].instanceID;
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
        } else {

        }
    }

    $scope.selectItemToInstall = function (itemToInstall) {
        if ($scope.online == true) {
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
        } else {

        }
    }

    $scope.selectPart = function () {
        if ($scope.online == true) {
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
        } else {

        }
    }

    $scope.removeNonSerializedItem = function () {
        if ($scope.online == true) {
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
        } else {

        }
    }

    $scope.SaveSelectedMaterial = function () {
        if ($scope.online == true) {
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
                parentInstanceID: $scope.parentInstanceID,
                instanceID: $scope.instanceID,
                returnReason: '',
                installRemoveProductId:''
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
                returnReason: $scope.returnReason,
                installRemoveProductId: $scope.removeInventoryItemID   //installRemoveProductId
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
                $scope.installRemoveProductId = "";
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
                installRemoveProductId: $scope.removeInventoryItemID,  //installRemoveProductId,      //removeInventoryItemID,
                
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
                $scope.installRemoveProductId = "";
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
        } else {
            //ofline mode
        }
    }

    $scope.SearchNonSearilizedItems = function () {
        if ($scope.online == true) {
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
        } else {
            //offline mode
        }
    }

    $scope.showExchangedMaterialScreen = function () {
        if (window.navigator.onLine) {
            $scope.online = true;
        } else {
            $scope.online = false;
            $('#offlineDiv').show();
            $scope.BackToMaterials;
        }
        if ($scope.online == true) {
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
        $scope.installRemoveProductId = "";
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
        } else {
            $('#offlineDiv').show();
            $scope.BackToMaterials;
        }
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

    $scope.statusOptionsInPlanning = [
    { name: 'Accept' },
    { name: 'Auto In Planning' }
    ];
    $scope.statusOptionInPlanning = $scope.statusOptionsInPlanning[1];

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

   //Active Contracts Controller
    $scope.acceptTask = function () {
        if ($scope.statusOption.name != 'Accept' && $scope.statusOptionInPlanning.name != 'Accept') {
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

function getStatusOptions($scope, $http) {
 
    if ($scope.online == true) {
   
        if ($scope.statusListOptions == undefined || $scope.statusListOptions == null || $scope.statusListOptions == '') {
            $http({
                method: "GET",
                url: "api/Tasks/GetTaskStatusList/" + $scope.tskD.TSK.StatusID,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (dataStatus, status, headers, config) {
                var statusArr = [];
                var intStatus = null;
                var stsList = dataStatus;
         
                if ($scope.statusName != 'Accepted') {
                    intStatus =
                        {
                            InitialStatusId: $scope.status,
                            InitialStatusName: $scope.statusName,
                            FinalStatusId: $scope.status,
                            FinalStatusName: $scope.statusName
                        }
                    statusArr.push(intStatus);
                }


                if (stsList instanceof Array) {
                    stsList.forEach(function (sts) {
                        if (sts.InitialStatusId == $scope.status) {
                            if (sts.FinalStatusName != 'Cancelled' && sts.FinalStatusName != 'Debrief Complete') {
                                statusArr.push(sts);
                            }
                        }
                    })
                } else {// not array
                    statusArr.push(stsList);
                }
                if ($scope.statusName == 'Working') {
                    intStatus =
                        {
                            InitialStatusId: $scope.status,
                            InitialStatusName: $scope.statusName,
                            FinalStatusId: 11001,
                            FinalStatusName: 'Debrief Complete'
                        }
                    statusArr.push(intStatus);
                }

               return $scope.statusListOptions = statusArr;
            })
            .error(function (data, status, headers, config) {
             //   console.log('error !!!!');
                showLoading(false);
            });
        } else {//$scope.statusListOptions is Defined
            $scope.statusListOptions.forEach(function (sts) {
                if (sts.InitialStatusId == $scope.status) {
                    if (sts.FinalStatusName != 'Cancelled') {
                        statusArr.push(sts);
                    }
                }
            })
            return $scope.statusListOptions = statusArr;
        }
        return;
    } else {//offline

        var intStatus = null;
        var statusArr = [];
     //   console.log('$scope.status in updates = ' + $scope.status + '; $scope.statusName = ' + $scope.statusName);

        if ($scope.statusName != 'Accepted') {
            intStatus =
                {
                    InitialStatusId: $scope.status,
                    InitialStatusName: $scope.statusName,
                    FinalStatusId: $scope.status,
                    FinalStatusName: $scope.statusName
                }
            statusArr.push(intStatus);
        }

        $scope.db.get('-statusList', function (err, docStatusList) {
            $scope.$apply(function () {
                if (err) {

                } else {
                    var stsList = docStatusList['StatusList'];
                    if (stsList instanceof Array) {
                        stsList.forEach(function (sts) {
                            if (sts.InitialStatusId == $scope.status) {
                                if (sts.FinalStatusName != 'Cancelled' && sts.FinalStatusName != 'Debrief Complete') {
                                    statusArr.push(sts);
                                }
                            }
                        })
                    } else {// not array
                        statusArr.push(stList);
                    }
                    return $scope.statusListOptions = statusArr;                   
                }
            })
        })
    }   
}

function updateLaborTimes() {
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

function syncTaskUpdates($scope, $http, $location) {
 //   console.log('syncTaskUpdates');
    // this function will push all pending entries for all tasks only in online mode
    $scope.db = PouchDB('STARS_TASKS');
    $scope.dbPending = PouchDB('STARS_PENDING');

    var updFlg = false;
    var counter = 0;

    if (window.navigator.onLine) {
        $scope.online = true;

    } else {
        $scope.online = false;
    }

    $scope.dbPending.allDocs(function (err, res) { // getting all pending documents
        var updFlg = false;

        $scope.$apply(function () {
            if (err) {
             //   log(err);
                showLoading(false);
          //      console.timeEnd('PouchDB - all docs');
            } else {
                var itemId;
                res['rows'].forEach(function (item) {
                    itemId = item['id'].toString();
                    if (itemId.indexOf('-laborPending') > 0) {
                        $scope.dbPending.get(itemId, function (err, docPending) {
                            $scope.$apply(function () {
                                if (err) {//no pending labors
                                } else {
                                    var laborsArr = [];
                                    var arrToDel = [];
                                    $scope.counter = 0;
                                    ///==================
                                    var laborLocal = docPending['LaborPendingList'];  //['LaborPending'];      
                                    //  var pendingLabors = laborLocal['LaborPending'];

                                    $scope.pendingLen = laborLocal.length;

                                    if (laborLocal instanceof Array) {
                                        laborLocal.forEach(function (lbr) {
                                            $http({
                                                method: "POST",
                                                url: "api/Labors/addLabor",
                                                contentType: "application/json; charset=utf-8",
                                                data: JSON.stringify(lbr['LaborPending']), //laborClass),
                                                headers: fsaApp.session.getAuthenticationHeader()
                                            })
                                            .success(function (data, status, headers, config) {
                                                //display successfull message;
                                                showLoading(false);
                                                arrToDel.push(lbr['LaborPending']);

                                            })
                                            .error(function (data, status, headers, config) {
                                                showLoading(false);
                                                $scope.sync = false;
                                            });
                                        })
                                        var foundFlg = false;
                                        var notSynchedArr = [];

                                        if (arrToDel.length > 0) {
                                            laborLocal.forEach(function (lbr) {
                                                arrToDel.forEach(function (del) {
                                                    if (JSON.stringify(lbr['LaborPending']) == JSON.stringify(del)) {
                                                        foundFlg = true;
                                                    }
                                                })
                                                if (foundFlg == false) {
                                                    notSynchedArr.push(lbr);
                                                    foundFlg = false;
                                                }
                                            })
                                        }
                                        $scope.dbPending.remove(docPending);
                                        if (notSynchedArr.length > 0) {
                                            $scope.dbPending.put({
                                                _id: $routeParams.taskId + '-laborPending',
                                                LaborPendingList: notSynchedArr
                                            });
                                        }
                                    } else {//pending labor has single entry                   
                                        $http({
                                            method: "POST",
                                            url: "api/Labors/addLabor",
                                            contentType: "application/json; charset=utf-8",
                                            data: JSON.stringify(laborLocal['LaborPending']), //laborClass),
                                            headers: fsaApp.session.getAuthenticationHeader()
                                        })
                                        .success(function (data, status, headers, config) {
                                            showLoading(false);
                                            //   $scope.dbLabor.remove(docPending, function (err, response) { });
                                            $scope.dbPending.remove(docPending, function (err, response) { });
                                        })
                                        .error(function (data, status, headers, config) {
                                            showLoading(false);
                                        });
                                    }
                                }
                            })
                        })//end of adding pending entries
                    }
                    //status change 
             //       console.log('looking for status change for task id = ' + item.taskID + '; ' + item.taskId);
                    if (itemId.indexOf('-statusChange') > 0) {                       
                        $scope.dbPending.get(itemId, function (err, updDoc) {
                            $scope.$apply(function () {
                                if (err) {//no pending status change
                         //           console.log('no status change found');
                                    updFlg = false;
                                    return;
                                } else {
                                    showLoading(true);
                                    var newStatus;
                                    showLoading(false);
                                    var processFlg = false;
                                    var tmpTaskID = updDoc['taskID'];
                                   
                                    $http({
                                        method: "GET",
                                        url: "api/Tasks/" + tmpTaskID, //$routeParams.taskId,
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        headers: fsaApp.session.getAuthenticationHeader()
                                    })
                                    .success(function (dataTskDet, status, headers, config) {                                        
                                        //   var originalStatusID = dataTskDet['TaskDetails']['TSK'].StatusID;
                                        var originalStatusID = dataTskDet['TSK'].StatusID;                                     

                                        if (updDoc['Category'] == 'ChangeStatus') {
                                            newStatus = updDoc['status'];
                                            tmpTaskID = updDoc['taskID'];
                          
                                            var statusClass;
                                            // original status != 'Working'// when task in some other status but not working it has only option of current status and working
                                            //for example if status will be changeed from 'Waiting for PO to Waiting for test equipment then task will be invisible in oracle HTML page
                                            //if task in the following statuses: -Waiting for PO-, -Waiting for parts-, -Waiting for test equipment- than status can be changed only to -Working-
                                         //   console.log('newStatus = ' + newStatus + '; originalStatusID = ' + originalStatusID);
                                            if (newStatus != originalStatusID) {
                                                if (originalStatusID == 5 || newStatus == 5) {
                                                    statusClass = {
                                                        status: newStatus,
                                                        taskID: tmpTaskID
                                                    }
                                                    $http({
                                                        method: "POST",
                                                        url: "api/Tasks/" + tmpTaskID + "/ChangeStatus",
                                                        contentType: "application/json; charset=utf-8",
                                                        data: JSON.stringify(statusClass),
                                                        headers: fsaApp.session.getAuthenticationHeader()
                                                    })
                                                    .success(function (data, status, headers, config) {
                                                        updFlg = true;                                                   
                                                        $scope.dbPending.remove(updDoc);
                                                        
                                                        //*************************
                                                        /*
                                                        $http({
                                                            method: "GET",
                                                            url: "api/Tasks/" + tmpTaskID,
                                                            contentType: "application/json; charset=utf-8",
                                                            dataType: "json",
                                                            headers: fsaApp.session.getAuthenticationHeader()
                                                        })
                                                        .success(function (data, status, headers, config) {
                                                            showLoading(false);
                                                            $scope.tskD = data;                                                            
                                                            $scope.tskD.TSK.status = newStatus;
                                                           // $scope.tskD.TSK.statusName = 'Working';
                                                        //    $scope.statusName = $scope.tskD.TSK.statusName;

                                                      //      if ($scope.tskD.TSK.Status == "Debrief Complete") {//Debrief Complete is not allowed when offline
                                                      //          $location.path("/tasks/" + $routeParams.taskId);
                                                      //      }
                                                            $scope.db.get(tmpTaskID + '-details', function (err, doc) {         //response.rows[i].id, function (err, doc) {
                                                                $scope.$apply(function () {
                                                                    if (err) {
                                                                        var taskDetails = {
                                                                            _id: tmpTaskID + '-details',
                                                                            TaskID: tmpTaskID,
                                                                            UserID: $scope.UserName,
                                                                            TaskDetails: data
                                                                        }
                                                                        $scope.db.put(taskDetails);
                                                                    } else {
                                                                        if (JSON.stringify(doc['TaskDetails']) != JSON.stringify(data)) {
                                                                            var taskDetails = {
                                                                                _id: tmpTaskID + '-details',
                                                                                TaskID: tmpTaskID,
                                                                                UserID: $scope.UserName,
                                                                                TaskDetails: data
                                                                            }
                                                                            $scope.db.remove(doc);
                                                                            $scope.db.put(taskDetails);
                                                                        }
                                                                    }
                                                                })
                                                            })
                                                            
                                                            console.log('success status update; reloading');
                                                        })
                                                        .error(function (data, status, headers, config) {
                                                            updFlg = false;
                                                            showLoading(false);                                                                                                     
                                                        });
                                                        */
                                                        ///****************************
                                                     //   console.log('window.location = ' + window.location);
                                                    //    console.log('updFlg = ' + updFlg);
                                                        if (updFlg == true) {
                                                            window.location.reload(true);
                                                            updFlg = false;
                                                            return true;
                                                        }
                                                    })
                                                    .error(function (data, status, headers, config) {
                                                        updFlg = false;
                                                        showLoading(false);
                                                    })
                                                } else {
                                                    //change status to Working first and after that change to newStatus
                                                    statusClass = {
                                                        status: 5,
                                                        taskID: tmpTaskID
                                                    }
                                                    $http({
                                                        method: "POST",
                                                        url: "api/Tasks/" + tmpTaskID + "/ChangeStatus",
                                                        contentType: "application/json; charset=utf-8",
                                                        data: JSON.stringify(statusClass),
                                                        headers: fsaApp.session.getAuthenticationHeader()
                                                    })
                                                    .success(function (data, status, headers, config) {

                                                        statusClass = {
                                                            status: newStatus,
                                                            taskID: tmpTaskID
                                                        }
                                                        $http({
                                                            method: "POST",
                                                            url: "api/Tasks/" + tmpTaskID + "/ChangeStatus",
                                                            contentType: "application/json; charset=utf-8",
                                                            data: JSON.stringify(statusClass),
                                                            headers: fsaApp.session.getAuthenticationHeader()
                                                        })
                                                        .success(function (data, status, headers, config) {
                                                            updFlg = true;
                                                            $scope.dbPending.remove(updDoc);
                                                            if (updFlg == true) {
                                                                window.location.reload(true);
                                                                return updFlg = false;
                                                            }
                                                            //   console.log('success status update');
                                                        })
                                                        .error(function (data, status, headers, config) {
                                                            updFlg = false;
                                                            showLoading(false);
                                                        })
                                                    })
                                                    .error(function (data, status, headers, config) {
                                                        updFlg = false;
                                                        showLoading(false);
                                                    })
                                                }
                                                originalStatusID = newStatus;
                                            }                                 
                                        }
                                    })
                                    .error(function (data, status, headers, config) {
                                        updFlg = false;
                                        showLoading(false);
                                })

                                }
                            })
                        })
                    }//end status change
                })
            }
        })
    });
    showLoading(false);  
    //   $location.path("/tasks/" + $routeParams.taskId + "/rtnTsk/chStatusMsg");
}

function loadDataLists($scope, $http) {

    $scope.db = PouchDB('STARS_TASKS');
    $scope.dbPending = PouchDB('STARS_PENDING');

    var incidentID;
    var tmpinstallFlg;
    var tmpsupportFlg;
    var tmpSystemID;
    var prdItemsActual;   

    if ($scope.tasks.length > 0) {
        $scope.tasks.forEach(function (node) {
            var tmpIncidentID = node['IncidentID'];
            var tmpTaskID = node.ID;
            var tmpSRTypeID = node['SRTypeID'];
            var tmpStatusID;
         //   console.log('node = ' + JSON.stringify(node));

        //    console.log('tmpSRTypeID: ' + tmpSRTypeID);
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID, //$routeParams.taskId,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (dataTskDet, status, headers, config) {
                $scope.db.get(tmpTaskID + '-details', function (err, docTskDet) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskDetails = {
                                _id: tmpTaskID + '-details',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskDetails: dataTskDet
                            }
                            $scope.db.put(taskDetails);
                        } else {
                            if (docTskDet['TaskDetails'] != dataTskDet) {
                                var taskDetails = {
                                    _id: tmpTaskID + '-details',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskDetails: dataTskDet
                                }
                                $scope.db.remove(docTskDet);
                                $scope.db.put(taskDetails);
                            }
                        }
                    })
                })
                tmpinstallFlg = dataTskDet['TSK']['installFlg'];
                tmpSystemID = dataTskDet['TSK']['SystemID'];
                tmpStatusID = dataTskDet['TSK']['StatusID'];
               
                if (node.ID == tmpTaskID) {
                    node.installFlg = tmpinstallFlg;
                    node.SystemID = tmpSystemID;
                }
                ////end of task details
                ///**********products start                                                 
                $scope.dbPending = PouchDB('STARS_PENDING');
                $http({
                    method: "GET",
                    url: "api/Labors/" + tmpTaskID,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (dataLabor, status, headers, config) {
                    //  $scope.dbLabor.get(tmpTaskID + '-labors', function (err, docLabor) {
                    $scope.db.get(tmpTaskID + '-labors', function (err, docLabor) {
                        $scope.$apply(function () {
                            if (err) {
                                var taskLabors = {
                                    _id: tmpTaskID + '-labors',
                                    Labors: dataLabor
                                }
                                //   $scope.dbLabor.put(taskLabors);
                                $scope.db.put(taskLabors);
                            } else {
                                if (JSON.stringify(docLabor['Labors']) != JSON.stringify(dataLabor)) {
                                    var taskLabors = {
                                        _id: tmpTaskID + '-labors',
                                        Labors: dataLabor
                                    }
                                    //    $scope.dbLabor.remove(docLabor);
                                    //    $scope.dbLabor.put(taskLabors);
                                    $scope.db.remove(docLabor);
                                    $scope.db.put(taskLabors);
                                }
                            }
                        })
                    })
                })
                .error(function (dataLabor, status, headers, config) {
                    showLoading(false);
                });

                //loading service reasons to local database 

                $http({
                    method: "GET",
                    url: "api/Labors/" + tmpSRTypeID + "/GetServiceReasons",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (dataReasons, status, headers, config) {
                    var reasonsArr = [];
                    dataReasons.forEach(function (res) {
                        reasonsArr.push(res);
                    })
                    if (tmpSRTypeID != 11011) {
                     //   console.log('adding travel to/travel from srtypeId = ' + tmpSRTypeID);
                        var srRes;
                        srRes = {
                            ReasonCode: "TRAVEL_TO",
                            ReasonName: "Travel To",
                            SRTypeID: tmpSRTypeID,
                            LookupCode: ""
                        }
                        reasonsArr.push(srRes);
                        srRes = {
                            ReasonCode: "TRAVEL_FROM",
                            ReasonName: "Travel From",
                            SRTypeID: tmpSRTypeID,
                            LookupCode: ""
                        }
                        reasonsArr.push(srRes);
                    }
                    //    $scope.dbLabor.get(tmpSRTypeID + '-serviceReasons', function (err, docReasons) {
                    $scope.db.get(tmpSRTypeID + '-serviceReasons', function (err, docReasons) {
                        $scope.$apply(function () {
                            if (err) {
                                var reasons = {
                                    _id: tmpSRTypeID + '-serviceReasons',
                                    ServiceReasons: reasonsArr      //dataReasons  //dataReasons
                                }
                                $scope.db.put(reasons);
                            } else {
                                if (JSON.stringify(docReasons['ServiceReasons']) != JSON.stringify(dataReasons)) {
                                    var reasons = {
                                        _id: tmpSRTypeID + '-serviceReasons',
                                        ServiceReasons: reasonsArr      //dataReasons
                                    }
                                    $scope.db.remove(docReasons);
                                    $scope.db.put(reasons);
                                }
                            }
                        })
                    })
                    //    console.log('service reason: ' + JSON.stringify(ServiceReasons));
                })
                .error(function (data, status, headers, config) {
                    showLoading(false);

                });
                if (node.installFlg != 'yes' || node.installFlg == '') {
                    $http({
                        method: "GET",
                        url: "api/Labors/" + tmpIncidentID + "/GetProductItems",    //tskD.TSK.IncidentID
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: fsaApp.session.getAuthenticationHeader()
                    })
                    .success(function (data, status, headers, config) {
                        $scope.db.get(tmpTaskID + '-productItems', function (err, doc) {
                            $scope.$apply(function () {
                                if (err) {
                                    var ProductItems = {
                                        _id: tmpIncidentID + '-productItems',
                                        ProductItems: data
                                    }
                                    $scope.db.put(ProductItems);
                                } else {
                                    if (JSON.stringify(doc['ProductItems']) != JSON.stringify(data)) {
                                        var ProductItems = {
                                            _id: tmpIncidentID + '-productItems',
                                            ProductItems: data
                                        }
                                        //     $scope.dbLabor.remove(doc);
                                        //     $scope.dbLabor.put(ProductItems);
                                        $scope.db.remove(doc);
                                        $scope.db.put(ProductItems);
                                    }
                                }
                            })
                        })
                    })
                    .error(function (data, status, headers, config) {

                    });
                }

                //loading subcomponentName into dbLabor                                 
                $http({
                    method: "GET",
                    url: "api/Labors/" + tmpIncidentID + "/GetSubcomponentName",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
                .success(function (data, status, headers, config) {
                    //   $scope.dbLabor.get(tmpTaskID + '-subcomponent', function (err, doc) {
                    $scope.db.get(tmpTaskID + '-subcomponent', function (err, doc) {
                        $scope.$apply(function () {
                            if (err) {
                                var Subcomponent = {
                                    _id: tmpIncidentID + '-subcomponent',
                                    Subcomponent: data
                                }
                                //    $scope.dbLabor.put(Subcomponent);
                                $scope.db.put(Subcomponent);
                            } else {
                                if (JSON.stringify(doc['Subcomponent']) != JSON.stringify(data)) {
                                    var Subcomponent = {
                                        _id: tmpIncidentID + '-subcomponent',
                                        Subcomponent: data
                                    }
                                    //   $scope.dbLabor.remove(doc);
                                    //   $scope.dbLabor.put(Subcomponent);
                                    $scope.db.remove(doc);
                                    $scope.db.put(Subcomponent);
                                }
                            }
                        })
                    })
                })
                .error(function (data, status, headers, config) {
                });
                ///**********products end                
            })
            .error(function (dataTskDet, status, headers, config) {
                showLoading(false);
            //    console.log("error getting task details");
            });
            ////task details

            //loading SR notes to local db
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpIncidentID + "/GetTaskNotes",       //$scope.tskD.TSK.IncidentID + "/GetTaskNotes",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
             .success(function (data, status, headers, config) {
                 $scope.db.get(tmpTaskID + '-SRnotes', function (err, doc) {
                     $scope.$apply(function () {
                         if (err) {
                             var srNotes = {
                                 _id: tmpTaskID + '-SRnotes',
                                 TaskID: tmpTaskID,
                                 UserID: $scope.UserName,
                                 SRNotes: data
                             }
                             $scope.db.put(srNotes);
                         } else {
                             if (JSON.stringify(doc['SRNotes']) != JSON.stringify(data)) {
                                 var srNotes = {
                                     _id: tmpTaskID + '-SRnotes',
                                     TaskID: tmpTaskID,
                                     UserID: $scope.UserName,
                                     SRNotes: data
                                 }
                                 $scope.db.remove(doc);
                                 $scope.db.put(srNotes);
                             }
                         }
                     })
                 })
             })
             .error(function (data, status, headers, config) {
             });

            //loading task notes to local db
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID + "/Notes",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-notes', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var TaskNotes = {
                                _id: tmpTaskID + '-notes',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskNotes: data
                            }
                            $scope.db.put(TaskNotes);
                        } else {
                            if (JSON.stringify(doc['TaskNotes']) != JSON.stringify(data)) {
                                var TaskNotes = {
                                    _id: tmpTaskID + '-notes',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskNotes: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(TaskNotes);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {
            });
            //loading counter to local db
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpIncidentID + "/GetCounter",       //$scope.tskD.TSK.IncidentID + "/GetTaskNotes",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-counter', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskCounter = {
                                _id: tmpTaskID + '-counter',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskCounter: data
                            }
                            $scope.db.put(taskCounter);
                        } else {
                            if (JSON.stringify(doc['TaskCounter']) != JSON.stringify(data)) {
                                var taskCounter = {
                                    _id: tmpTaskID + '-counter',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskCounter: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskCounter);
                            }
                        }
                    })
                })
            })
             .error(function (data, status, headers, config) {

             });
            //loading manager approval to local db                               
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID + "/GetManagerApproval",      //$routeParams.taskId + "/GetManagerApproval",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-managerApproval', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskManagerApproval = {
                                _id: tmpTaskID + '-managerApproval',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskManagerApproval: data
                            }
                            $scope.db.put(taskManagerApproval);
                        } else {
                            if (JSON.stringify(doc['TaskManagerApproval']) != JSON.stringify(data)) {
                                var taskManagerApproval = {
                                    _id: tmpTaskID + '-managerApproval',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskManagerApproval: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskManagerApproval);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {
               // $("#tskErr").html("Error: " + data.ExceptionMessage);
                // showTimedElem('tskErr');
               
            });

            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID + "/GetSystemDown",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-systemDown', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskSystemDown = {
                                _id: tmpTaskID + '-systemDown',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskSystemDown: data
                            }
                            $scope.db.put(taskSystemDown);
                        } else {
                            if (JSON.stringify(doc['ProductItems']) != JSON.stringify(data)) {
                                var taskSystemDown = {
                                    _id: tmpTaskID + '-systemDown',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskSystemDown: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskSystemDown);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {
            });
            //loading fax/email to local db
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID + "/GetFaxEmail",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-faxEmail', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskFaxEmail = {
                                _id: tmpTaskID + '-faxEmail',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskFaxEmail: data
                            }
                            $scope.db.put(taskFaxEmail);
                        } else {
                            if (JSON.stringify(doc['TaskFaxEmail']) != JSON.stringify(data)) {
                                var taskFaxEmail = {
                                    _id: tmpTaskID + '-faxEmail',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskFaxEmail: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskFaxEmail);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {
            });

            //loading FDA questions                           
            $http({
                method: "GET",
                url: "api/Tasks/" + tmpTaskID + "/GetFDAQuestions",
                contentType: "application/json; charset=utf-8",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-fdaQuestions', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskFDAQuestions = {
                                _id: tmpTaskID + '-fdaQuestions',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskFDAQuestions: data
                            }
                            $scope.db.put(taskFDAQuestions);
                        } else {
                            if (JSON.stringify(doc['ProductItems']) != JSON.stringify(data)) {
                                var taskFDAQuestions = {
                                    _id: tmpTaskID + '-fdaQuestions',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskFDAQuestions: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskFDAQuestions);
                            }
                        }
                    })
                })
            })
            .error(function (data, status, headers, config) {
            });

            //loading materials to local db
            $http({
                method: "GET",
                url: "api/getMaterials/" + tmpTaskID,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: fsaApp.session.getAuthenticationHeader()
            })
            .success(function (data, status, headers, config) {
                $scope.db.get(tmpTaskID + '-materials', function (err, doc) {
                    $scope.$apply(function () {
                        if (err) {
                            var taskMaterials = {
                                _id: tmpTaskID + '-materials',
                                TaskID: tmpTaskID,
                                UserID: $scope.UserName,
                                TaskMaterials: data
                            }
                            $scope.db.put(taskMaterials);
                        } else {
                            if (JSON.stringify(doc['TaskMaterials']) != JSON.stringify(data)) {
                                var taskMaterials = {
                                    _id: tmpTaskID + '-materials',
                                    TaskID: tmpTaskID,
                                    UserID: $scope.UserName,
                                    TaskMaterials: data
                                }
                                $scope.db.remove(doc);
                                $scope.db.put(taskMaterials);
                            }
                        }
                    })
                })
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

            if ($scope.TaskStatusMapping == undefined || $scope.TaskStatusMapping == null || $scope.TaskStatusMapping == '') {       
                $http({
                    method: "GET",
                    url: "api/Tasks/GetTaskStatusList/0",                 
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: fsaApp.session.getAuthenticationHeader()
                })
           .success(function (dataStatus, status, headers, config) {
               $scope.db.get('-statusList', function (err, docStatusList) {
                   $scope.$apply(function () {
                       if (err) {
                           var statusList = {
                               _id: '-statusList',
                               StatusList: dataStatus
                           }
                           $scope.db.put(statusList);
                       } else {
                           if (JSON.stringify(docStatusList['StatusList']) != JSON.stringify(dataStatus)) {
                               var statusList = {
                                   _id: '-statusList',
                                   StatusList: dataStatus      //dataReasons
                               }
                               $scope.db.remove(docStatusList);
                               $scope.db.put(statusList);                               
                           }                                    
                       }
                   })
               })
           })
           .error(function (dataStatus, status, headers, config) {         
               showLoading(false);
           });
            }
        });  //forEach node
        ///==============end of node     
        showLoading(false);
    }

    $http({
        method: "GET",
        url: "api/getSavedLocations",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.db.get('-savedLocations', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    var savedLocations = {
                        _id: '-savedLocations',
                        UserID: $scope.UserName,
                        SavedLocations: data
                    }
                    $scope.db.put(savedLocations);
                } else {
                    if (JSON.stringify(doc['SavedLocations']) != JSON.stringify(data)) {
                        var savedLocations = {
                            _id: '-savedLocations',
                            UserID: $scope.UserName,
                            SavedLocations: data
                        }
                        $scope.db.remove(doc);
                        $scope.db.put(savedLocations);
                    }
                }
            })

            if (data.length > 0) {
                data.forEach(function (loc) {
                    var tmpSavedLocationID = loc['key'];
                    $http({
                        method: "GET",
                        url: "api/getInventory/" + tmpSavedLocationID,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        headers: fsaApp.session.getAuthenticationHeader()
                    })
                    .success(function (dataInv, status, headers, config) {
                        $scope.db.get(tmpSavedLocationID + '-inventory', function (err, doc) {
                            $scope.$apply(function () {
                                if (err) {
                                    var inventory = {
                                        _id: tmpSavedLocationID + '-inventory',
                                        UserID: $scope.UserName,
                                        Inventory: dataInv
                                    }
                                    $scope.db.put(inventory);
                                } else {
                                    if (JSON.stringify(doc['Inventory']) != JSON.stringify(dataInv)) {
                                        var inventory = {
                                            _id: tmpSavedLocationID + '-inventory',
                                            UserID: $scope.UserName,
                                            Inventory: dataInv
                                        }
                                        $scope.db.remove(doc);
                                        $scope.db.put(inventory);
                                    }
                                }
                            })
                        })
                        //display successfull message;                       
                        if (dataInv.length > 0) {
                            dataInv.forEach(function (item) {
                                var tmpInventoryID = item['inventoryID'];
                                $http({
                                    method: "GET",
                                    url: "api/getInventoryDetail/" + tmpSavedLocationID + "/" + tmpInventoryID,
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    headers: fsaApp.session.getAuthenticationHeader()
                                })
                                .success(function (dataItems, status, headers, config) {
                                    $scope.db.get(tmpSavedLocationID + '-' + tmpInventoryID + '-inventoryItems', function (err, doc) {
                                        $scope.$apply(function () {
                                            if (err) {
                                                var inventoryItems = {
                                                    _id: tmpSavedLocationID + '-' + tmpInventoryID + '-inventoryItems',
                                                    UserID: $scope.UserName,
                                                    InventoryItems: dataItems
                                                }
                                                $scope.db.put(inventoryItems);
                                            } else {
                                                if (JSON.stringify(doc['InventoryItems']) != JSON.stringify(data)) {
                                                    var inventoryItems = {
                                                        _id: tmpSavedLocationID + '-' + tmpInventoryID + '-inventoryItems',
                                                        UserID: $scope.UserName,
                                                        InventoryItems: dataItems
                                                    }
                                                    $scope.db.remove(doc);
                                                    $scope.db.put(inventoryItems);
                                                }
                                            }
                                        })
                                    })
                                    //display successfull message; 

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
                            })
                        }
                    })
                    .error(function (data, status, headers, config) {
                    });
                })
            }
        })
    })
    .error(function (data, status, headers, config) {
    })

    //loading where abouts to local db
    $http({
        method: "GET",
        url: "api/getWhereAbout",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: fsaApp.session.getAuthenticationHeader()
    })
    .success(function (data, status, headers, config) {
        $scope.db.get('-whereabout', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    var whereabout = {
                        _id: '-whereabout',
                        UserID: $scope.UserName,
                        Whereabout: data
                    }
                    $scope.db.put(whereabout);
                } else {
                    if (JSON.stringify(doc['ProductItems']) != JSON.stringify(data)) {
                        var whereabout = {
                            _id: '-whereabout',
                            UserID: $scope.UserName,
                            Whereabout: data
                        }
                        $scope.db.remove(doc);
                        $scope.db.put(whereabout);
                    }
                }
            })
        })
    })
    .error(function (data, status, headers, config) {
        showLoading(false);
        if (status == 401) {
            $location.path("/login");
        } else {
            //display error in a label
            $('#waErrMsgMain').html("Error: " + data.ExceptionMessage);
            showTimedElem('waErrMsgMain');
        }
    });

}

function checkStatusChangeOffline($scope, $routeParams, $http) {
  //  console.log('checkStatusChangeOffline($scope) ');

 //   $scope.getTaskUpdates();

//    $scope.getTaskUpdates = function () {
        $scope.dbPending = PouchDB('STARS_PENDING');
        $scope.db = PouchDB('STARS_TASKS');

    //    console.log('checkStatusChangeOffline($scope) = ' + $routeParams.taskId + '; $scope.status = ' + $scope.status);
        var newStatus;
        var newStatusName;
     //   console.log('$scope.online checkStatusChangeOffline($scope) = ' + $scope.online);

        $scope.dbPending.get($routeParams.taskId + '-statusChange', function (err, doc) {
            $scope.$apply(function () {
                if (err) {
                    return;
                } else {
                    if (doc['Category'] == 'ChangeStatus') {
                        var pndStatus = doc['Pending'];
                    //    console.log('pndStatus = ' + JSON.stringify(pndStatus));
                        if (pndStatus instanceof Array) {

                            newStatus = pndStatus[pndStatus.length - 1]['status'];            //newStatus['status']; 
                            $scope.status = newStatus;
                        } else {
                            newStatus = pndStatus['status'];
                            $scope.status = newStatus;
                        }
                        if ($scope.online == true) {
                            showLoading(false);        
                        } else {    //offline                    
                            //get StatusName
                            // $scope.getStatusName();
                            $scope.db.get('-statusList', function (err, docStatusList) {
                                $scope.$apply(function () {
                                    if (err) {
                                    } else {
                                        var stsList = docStatusList['StatusList'];
                                        var foundFlg = false;

                                        stsList.forEach(function (sts) {
                                            if (foundFlg == false) {
                                                if (sts.InitialStatusId == $scope.status) {
                                                    newStatusName = sts.InitialStatusName;
                                                    $scope.statusName = newStatusName;
                                                    $scope.tskD.TSK.Status = newStatusName;
                                                    if ($scope.online == true) {
                                                        //   $scope.tskD.TSK.StatusID = $scope.status;
                                                        $scope.tskD.TSK.Status = $scope.statusName;
                                                    } else {
                                                        $scope.tskD.TSK.Status = '** ' + $scope.statusName;
                                                    }
                                                    getStatusOptions($scope, $http);
                                                    foundFlg = true;
                                                }
                                            }
                                        })

                                    }
                                })
                            })
                        //    return;
                        }
                    }
                }
            })
        });
        return true;
    // }
    /*
    $scope.getStatusName = function () {

        $scope.db.get('-statusList', function (err, docStatusList) {
            $scope.$apply(function () {
                if (err) {
                } else {
                    var stsList = docStatusList['StatusList'];
                    var foundFlg = false;

                    stsList.forEach(function (sts) {
                        if (foundFlg == false) {
                            if (sts.InitialStatusId == $scope.status) {
                                newStatusName = sts.InitialStatusName;
                                $scope.statusName = newStatusName;
                                $scope.tskD.TSK.Status = newStatusName;
                                if ($scope.online == true) {
                                    //   $scope.tskD.TSK.StatusID = $scope.status;
                                    $scope.tskD.TSK.Status = $scope.statusName;
                                } else {
                                    $scope.tskD.TSK.Status = '** ' + $scope.statusName;
                                }
                                getStatusOptions($scope, $http);
                                foundFlg = true;
                            }
                        }
                    })

                }
            })
        })
        return;
    }
    */
}

function updateOnlineStatus(msg, refresh) {
 /*   if (refresh) {
        var url = window.location.toString();
        if (url.indexOf('labors') > 0) {
        } else {
            window.location.reload();
        }
    }
    */
    //  else {
    var status = document.getElementById("status");
    var state = document.getElementById("state");
    var condition = navigator.onLine ? "<img src='../Images/online.png' height='15px' />" : "<img src='../Images/offline.png' height='15px' />";
    var condition1 = navigator.onLine ? $('#onlineDiv').show() : $('#onlineDiv').hide();
    var condition2 = navigator.onLine ? $('#offlineDiv').hide() : $('#offlineDiv').show();
    var condition3 = navigator.onLine ? $('#offlineDiv1').hide() : $('#offlineDiv1').show();

    status.setAttribute("class", condition);
    state.innerHTML = condition;
    //  }
}

function loaded() {
    updateOnlineStatus("load", false);
    document.body.addEventListener("offline", function () { updateOnlineStatus("offline", true) }, false);
    document.body.addEventListener("online", function () {
        updateOnlineStatus("online", true);

    }, false);

}