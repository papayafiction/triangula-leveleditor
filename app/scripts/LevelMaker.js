function LevelMaker() {

    /** ## Private ## **/
    var LEVEL_MAKER_VERSION = 5;
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
            bubbles: [],
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
            var style = $(this).attr("style");
            $(this).css("-webkit-transform","none");
            var position = $(this).position();
            $(this).attr("style", style);
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
            var style = $(this).attr("style");
            $(this).css("-webkit-transform", "none");
            var position = $(this).position();
            $(this).attr("style", style);
            
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
            var style = $(this).attr("style");
            $(this).css("-webkit-transform", "none");
            var position = $(this).position();
            $(this).attr("style", style);

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

        // Add Bubbles
        $(".bubble").each(function () {
            var position = $(this).position();

            json.bubbles.push({
                x: position.left,
                y: position.top,
                size: $(this).width()
            });
        });

        json.colors.push($("#triangleColorPicker1").data("current-color").substr(1,6));
        json.colors.push($("#triangleColorPicker2").data("current-color").substr(1, 6));
        json.colors.push($("#bubbleColorPicker1").data("current-color").substr(1, 6));
        json.colors.push($("#bubbleColorPicker2").data("current-color").substr(1, 6));
        json.colors.push($("#backgroundColorPicker").data("current-color").substr(1, 6));

        
        json.name = $("#level-name").val();
        
        json.created_at = getDateTime();
        
        return json;
    };
    
    this.getLevelString = function() {
        return JSON.stringify(this.getLevelJson());
    };

    this.loadLevelByName = function(tag) {

        $.ajax({url:"http://triangula.papaya-fiction.com/levels/" + tag + ".txt",
            success:function(result){
                $("#load-name-input").css({borderColor:"green", color: "green"});
                $("#load-name-input").attr("placeholder", "load by name");
                $("#load-json-input").css({borderColor:"", color: ""});
                $("#load-json-input").val("");
                $("#load-json-input").attr("placeholder", "load by JSON");

                levelMaker.loadLevelString(result, false);
            },
            error:function(result){
                $(".level").html("");

                $("#load-name-input").css({borderColor:"#a94442", color: ""});
                $("#load-name-input").val("");
                $("#load-name-input").attr("placeholder", "tag not found");
                $("#load-json-input").css({borderColor:"", color: ""});
                $("#load-json-input").val("");
                $("#load-json-input").attr("placeholder", "load by JSON");

            }
        });

    };

    this.loadLevelString = function (lvl, directInput) {
        $(".level").html("");

        try {
            var level = JSON.parse(lvl);
        } catch (e) {
            if(directInput) {
                $("#load-name-input").css({borderColor:"", color: ""});
                $("#load-name-input").val("");
                $("#load-name-input").attr("placeholder", "load by name");
                $("#load-json-input").css({borderColor:"#a94442", color: ""});
                $("#load-json-input").attr("placeholder", "JSON not valid");
                $("#load-json-input").val("");

            } else {
                $("#load-name-input").css({borderColor:"#a94442", color: ""});
                $("#load-name-input").val("");
                $("#load-name-input").attr("placeholder", "JSON not valid");
                $("#load-json-input").css({borderColor:"", color: ""});
                $("#load-json-input").attr("placeholder", "load by JSON");
                $("#load-json-input").val("");
            }

        }

        if(level.triangles) {
            $.each(level.triangles,function(key,triangle) {
                levelMaker.addTriangle(triangle);
            });
        }

        if(level.doors) {
            var doorCount = 0;
            $.each(level.doors,function(key,door) {
                levelMaker.addDoor(door);
            });
        }
        
        if(level.bombs) {
            $.each(level.bombs,function(key,bomb) {
                levelMaker.addBomb(bomb);
            });
        }

        if(level.exits) {
            $.each(level.exits, function (key, exit) {
                levelMaker.addExit(exit);
            });
        }
        
        if(level.spikes) {
            $.each(level.spikes,function(key,spike) {
                levelMaker.addSpike(spike);
            });
        }

        if (level.bubbles) {
            $.each(level.bubbles, function (key, bubble) {
                levelMaker.addBubble(bubble);
            });
        }

        
        // Set color picker backgrounds
        $("#triangleColor1").css("background-color", "#" + level.colors[0]);
        $("#triangleColor2").css("background-color", "#" + level.colors[1]);
        $("#bubbleColor1").css("background-color", "#" + level.colors[2]);
        $("#bubbleColor2").css("background-color", "#" + level.colors[3]);
        $("#backgroundColor").css("background-color", "#" + level.colors[4]);
        // Set color picker data
        $("#triangleColorPicker1").data("current-color", "#" + level.colors[0]);
        $("#triangleColorPicker2").data("current-color", "#" + level.colors[1]);
        $("#bubbleColorPicker1").data("current-color", "#" + level.colors[2]);
        $("#bubbleColorPicker2").data("current-color", "#" + level.colors[3]);
        $("#backgroundColorPicker").data("current-color", "#" + level.colors[4]);


        $("#level-name").val(level.name);
        
        $(".level").append('<div class="player"></div>');



        if(directInput) {
            $("#load-name-input").css({borderColor:"", color: ""});
            $("#load-name-input").val("");
            $("#load-name-input").attr("placeholder", "load by name");
            $("#load-json-input").css({borderColor:"green", color: "green"});
            $("#load-json-input").attr("placeholder", "load by JSON");

        } else {
            $("#load-name-input").css({borderColor:"#green", color: "green"});
            $("#load-name-input").attr("placeholder", "load by name");
            $("#load-json-input").css({borderColor:"", color: ""});
            $("#load-json-input").attr("placeholder", "load by JSON");
            $("#load-json-input").val("");
        }


        window.setTimeout(function() {
            setColors();
        },100);
    };
    
    this.saveLevel = function() {
        pushHistoryEntry(this.getLevelJson());
    };
    
    this.getHistory = function() {
        return getHistory();
    };
    
    this.deleteHistory = function() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
        $("#table-body").empty();
    };
    
    this.getHistoryEntryHtml = function(value) {
        return "<tr><td>" + value.name + "</td><td>" + value.created_at + "</td><td><input type='text' class='form-control level-string-input' readonly value='" + JSON.stringify(value) + "'></td><td><button type='button' class='btn load-level-btn'>Load</button></td></tr>";
    };



    this.addTriangle = function (triangle) {

        var $triangle = $("<div class='triangle'></div>");
        $triangle.draggable({snap: ".triangle"}).resizable({
            aspectRatio: 1
        }).rotatable();

        if(triangle) {
            $triangle.css({width:triangle.size,height:triangle.size, top: triangle.y, left: triangle.x});
            $triangle.data("angle",triangle.angle);
            window.setTimeout(function() {
                $triangle.css({"-webkit-transform": "rotate(" + (triangle.angle*-1) + "deg)"});
            },10);
        }
        $triangle.css("background-color",getObjectColor("triangle"));
        $triangle.appendTo($(".level"));

        $triangle.click(function() {
            removeItem($triangle);
        });
    };


    this.addDoor = function (door) {
        var $switch = $("<div class='door-switch' id='door-switch-" + doorCount + "'>" + doorCount + "</div>");
        var $door = $("<div class='triangle door' id='door-" + doorCount + "'>" + doorCount + "</div>");
        $switch.draggable();
        $door.draggable().resizable({
            aspectRatio: 1
        }).rotatable();

        if(door) {
            $switch.css({top:door.switch.y,left:door.switch.x});
            $door.css({top:door.door.y,left:door.door.x,width: door.door.size, height: door.door.size});
            $door.data("angle", door.door.angle);
            
            window.setTimeout(function () {
                $door.css({"-webkit-transform": "rotate(" + (door.door.angle * -1) + "deg)"});
            }, 10);

        }
        $(".level").append($switch);
        $(".level").append($door);
        ++doorCount;

        $door.click(function() {
            if (Triangula.removeMode) {
                removeItem($door);
                Triangula.removeMode = true;
                removeItem($switch);
            }
        });
        $switch.click(function() {
            if (Triangula.removeMode) {
                removeItem($door);
                Triangula.removeMode = true;
                removeItem($switch);
            }
        });

    };

    this.addBomb = function (bomb) {
        var $bomb = $("<div class='bomb'></div>");
        $bomb.draggable();
        if(bomb) {
            $bomb.css({top: bomb.y, left: bomb.x});
        }
        $bomb.click(function() {
            removeItem($bomb);
        });

        $(".level").append($bomb);
    };

    this.addBubble = function(bubble) {
        var $bubble = $("<div class='bubble'></div>");
        $bubble.draggable().resizable({
            aspectRatio: 1
        });
        if (bubble) {
            $bubble.css({top: bubble.y, left: bubble.x, width: bubble.size, height: bubble.size});
        }
        $bubble.css("background-color", getObjectColor("triangle"));
        $bubble.click(function () {
            removeItem($bubble);
        });

        $(".level").append($bubble);
    };

    this.addExit = function(exit) {
        var $exit = $("<div class='exit'></div>");
        $exit.draggable();
        if(exit) $exit.css({top: exit.y, left: exit.x});
        $exit.click(function() {
            removeItem($exit);
        });
        $(".level").append($exit);
    };

    this.addSpike = function(spike) {

        var triangle = "<div class='triangle'></div>";
        var $spikes = $("<div class='spikes'></div>");


        if(spike) {
            var amount = spike.count;
        } else {
            var amount = parseInt($("#spikes-count").val());
        }

        $spikes.css("width", amount * 100);

        var i = amount;
        while (i--) {
            var $triangle = $(triangle);
            $triangle.css('left', i * 100);
            $triangle.css("background-color",getObjectColor("triangle"));
            $spikes.append($triangle);
        }

        if(spike) {
            $spikes.css({height: spike.size, top: spike.y, left: spike.x});

            $spikes.data("angle", spike.angle);
            window.setTimeout(function () {
                $spikes.css({"-webkit-transform": "rotate(" + (spike.angle * -1) + "deg)"});
            }, 10);

        }
        $(".level").append($spikes);

        $spikes.draggable().resizable({
            aspectRatio: amount,
            grid: [amount, 1]
        }).rotatable();

        $spikes.resize(function () {
            var $triangles = $(this).find(".triangle");
            var triangle_size = $(this).width() / $triangles.length;
            $triangles.css({
                'width': triangle_size,
                'height': triangle_size
            });
            var i = $triangles.length;
            $triangles.each(function () {
                --i;
                $(this).css('left', i * triangle_size);
            });
        });


        $spikes.click(function() {
            removeItem($spikes);
        });
    };
}

LevelMaker.prototype = {
    constructor: LevelMaker
};