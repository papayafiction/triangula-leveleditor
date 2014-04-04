function LevelMaker() {

    /** ## Private ## **/
    var LEVEL_MAKER_VERSION = 4;
    var LOCAL_STORAGE_KEY = "triangula_history";

    /** ## Private methods ## **/
    function getBase() {
        return {
            version: LEVEL_MAKER_VERSION,
            name: 'noname',
            created_at: '',
            triangles: [],
            spikes: [],
            doors: [],
            bombs: [],
            exits: [],
            colors: []
        };
    }
    
    function pushHistoryEntry(json) {
        var history = getHistory();
        history.push(json);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    }
    
    function getHistory() {
        if (localStorage.getItem(LOCAL_STORAGE_KEY) == null) return [];
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    }
    
    function getDateTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length == 1) {
            var month = '0' + month;
        }
        if (day.toString().length == 1) {
            var day = '0' + day;
        }
        if (hour.toString().length == 1) {
            var hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            var minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            var second = '0' + second;
        }
        var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
        return dateTime;
    }
    
    /** ## Public methods with private access ## **/
    this.getLevelJson = function () {
        var json = getBase();
        
        // Add triangles
        $(".level > .triangle").each(function() {
            if($(this).hasClass("door")) return;
            var angle = $(this).data("angle") ? new Number($(this).data("angle")).toFixed(parseInt(2)) : 0;
            var rotation = $(this).css("-webkit-transform");
            $(this).css("-webkit-transform","none");
            var position = $(this).position();
            $(this).css("-webkit-transform", rotation);
            json.triangles.push({
                x: position.left,
                y: position.top,
                size: $(this).width(),
                angle: angle
            });
        });

        // Add Spikes
        $(".spikes").each(function() {
            var angle = $(this).data("angle") ? new Number($(this).data("angle")).toFixed(parseInt(2)) : 0;
            var rotation = $(this).css("-webkit-transform");
            $(this).css("-webkit-transform", "none");
            var position = $(this).position();
            $(this).css("-webkit-transform", rotation);
            
            var count = $(this).find(".triangle").length;
            
            json.spikes.push({
                x: position.left,
                y: position.top,
                size: $(this).width() / count,
                angle: angle,
                count: count
            });
        });
        
        // Add doors
        $(".door").each(function() {
            var angle = $(this).data("angle") ? new Number($(this).data("angle")).toFixed(parseInt(2)) : 0;
            var rotation = $(this).css("-webkit-transform");
            $(this).css("-webkit-transform", "none");
            var position = $(this).position();
            $(this).css("-webkit-transform", rotation);

            var doorid = parseInt($(this).html());
            
            var $switch = $("#door-switch-" + doorid);
            var switchPosition = $switch.position();
            
            json.doors.push({
                door: {
                    x: position.left,
                    y: position.top,
                    angle: angle,
                    size: $(this).width()
                },
                switch: {
                    x: switchPosition.left,
                    y: switchPosition.top
                }
            })
        });
        
        // Add bombs
        $(".bomb").each(function() {
            var position = $(this).position();

            json.bombs.push({
                x: position.left,
                y: position.top
            })
        });

        // Add exits
        $(".exit").each(function () {
            var position = $(this).position();

            json.exits.push({
                x: position.left,
                y: position.top
            })
        });
        
        for(var i = 1;i <= 5;++i) {
            json.colors.push($("#color" + i).val());
        }
        
        json.name = $("#level-name").val();
        
        json.created_at = getDateTime();
        
        return json;
    };
    
    this.getLevelString = function() {
        return JSON.stringify(this.getLevelJson());
    };

    this.loadLevelString = function (string) {
        $(".level").html("");
        var level = JSON.parse(string);
        $.each(level.triangles,function(key,triangle) {
            var $triangle = $("<div class='triangle'></div>");
            $triangle.draggable({ containment: "parent" }).resizable({
                aspectRatio: 1
            }).rotatable({
                autoHide: false
            });
            $triangle.css({top:triangle.y,left:triangle.x,width:triangle.size,height:triangle.size})
            .appendTo($(".level"));
        });
        
        for(var i = 1;i<=5;++i) {
            $("#color" + i).val(level.colors[i-1]);
        }

        $("#level-name").val(level.name);
        
        setColors();
        updateColorInformation();
        
    };
    
    this.saveLevel = function() {
        pushHistoryEntry(this.getLevelJson());
    };
    
    this.getHistory = function() {
        return getHistory();
    };
    
    this.deleteHistory = function() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    };
    
    this.getHistoryEntryHtml = function(value) {
        return "<tr><td>" + value.name + "</td><td>" + value.created_at + "</td><td><input type='text' class='form-control level-string-input' readonly value='" + JSON.stringify(value) + "'></td><td><!--<button type='button' class='btn load-level-btn'>Load</button>--></td></tr>";
    }
}

LevelMaker.prototype = {
    constructor: LevelMaker
};