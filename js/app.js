var model = {
    init: function(numDays) {
        this.numDays = numDays || 12;
        this.loadDB();
    },
    students: [
        {
            id: 0,
            name: "Slappy the Frog",
            attendance: []
        },
        {
            id: 1,
            name: "Lilly the Lizard",
            attendance: []
        },
        {
            id: 2,
            name: "Paulrus the Walrus",
            attendance: []
        },
        {
            id: 3,
            name: "Gregory the Goat",
            attendance: []
        },
        {
            id: 4,
            name: "Adam the Anaconda",
            attendance: []
        }
    ],
    _getRandom: function() {
        return (Math.random() >= 0.5);
    },
    _randomAttendance: function(numDays) {
        var attendance = [];
        for (var i = 0; i < numDays; i++) {
            attendance.push(this._getRandom());
        }
        return attendance;
    },
    saveDB: function() {
        localStorage.attendance = JSON.stringify(this.students);
    },
    loadDB: function() {
        if(!localStorage.attendance) {
            console.log('Creating attendance records...');
            var self = this;
            // RandomInit
            this.students.forEach(function(student) {
                student.attendance = self._randomAttendance(self.numDays);
            });
            this.saveDB();
        } else {
            this.students = JSON.parse(localStorage.attendance);
        }
    },
    getAllStudents: function() {
        return this.students.slice(0);
    },
    getStudent: function(id) {
        var students = this.students.filter(function(student) {
            return student.id === id;
        }), student = null;

        if(students.length) {
            student = students[0];
        }
        return student;
    },
    getNumAttendance: function(studentId) {
        var student = this.getStudent(studentId),
            numAttendance = 0;
        if(student) {
            student.attendance.forEach(function(dayAttendance) {
                if(dayAttendance) {
                    numAttendance++;
                }
            });
        }
        return numAttendance;
    },
    getNumMissingDays: function(studentId) {
        return this.numDays - this.getNumAttendance(studentId);
    },
    toogleStudentAttendance: function(id, attendanceIdx) {
        var student = this.getStudent(id);
        if(student) {
            student.attendance[attendanceIdx] = !student.attendance[attendanceIdx];
        }
    }
};

// Fabric studentView
var studentView = function($mainEl, onClick) {
    var updateNumMissed = function(numMissed) {
        $mainEl.find('.missed-col').text(numMissed);
    },
    _onClick = function(student, attendanceIdx) {
        return function(e) {
            onClick(student, attendanceIdx, updateNumMissed);
        };
    }.bind(this);

    return {
        render: function(student) {
            var $td, numMissed = 0, i = 0, $input;
            $mainEl.append('<td class="name-col">'+student.name+'</td>');
            student.attendance.forEach(function(dayAttendance) {
                $input = $('<input type="checkbox">');
                $input.prop('checked', dayAttendance);
                $input.on('click', _onClick(student, i));
                $td = $('<td class="attend-col"></td>');
                $td.append($input); //appendChild
                $mainEl.append($td);
                if(!dayAttendance) {
                    numMissed++;
                }
                i++;
            });
            $td = $('<td class="missed-col">'+numMissed+'</td>');
            $mainEl.append($td);
        }
    };
};

var listStudentsView = {
    $mainEl: null,
    init: function(mainEl, onClick) {
        this.$mainEl = mainEl;
        this.onClick = onClick;
    },
    render: function(students) {
        var $tr, sView, self = this;
        students.forEach(function(student) {
            $tr = $('<tr class="student"></tr>');
            sView = studentView($tr, self.onClick);
            sView.render(student);
            self.$mainEl.append($tr);
        });
    }
};

var octopus = {
    init: function($el) {
        var numDays = 12;
        model.init(numDays);
        listStudentsView.init($el, this.onClick.bind(this));
        listStudentsView.render(model.getAllStudents());
    },
    onClick: function(student, attendanceIdx, updateNumMissedFunction) {
        console.log("Se ha oprimido un click");
        model.toogleStudentAttendance(student.id, attendanceIdx);
        model.saveDB();
        updateNumMissedFunction(model.getNumMissingDays(student.id));
    }
}

octopus.init($("#studentTable"));
