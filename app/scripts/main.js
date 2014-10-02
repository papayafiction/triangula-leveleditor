//object to store variables
Triangula = {

    removeMode:false

};

$(document).ready(function() {

    try {
        $("#colorpicker1").smallColorPicker({ /* options */ });
        $("#colorpicker2").smallColorPicker({ /* options */ });
        $("#colorpicker3").smallColorPicker({ /* options */ });
        $("#colorpicker4").smallColorPicker({ /* options */ });
        $("#colorpicker5").smallColorPicker({ /* options */ });
    } catch (err) {
        // the browser is not supported
    }

});



$(".color-btn").on ({
    scp_ok: function(picker, color) { setTimeout(setColors, 100); }, // color is selected
    scp_cancel: function(picker, color) {  }, // color selection cancelled
    scp_show: function(picker) {  }, // picker is shown
    scp_hide: function(picker) {  } // picker is hidden
});


var setColors = function() {

    var color1 = "#" + $("#color1").css("background-color");
    var color2 = "#" + $("#color2").css("background-color");
    var color3 = "#" + $("#color3").css("background-color");
    var color4 = "#" + $("#color4").css("background-color");
    var color5 = "#" + $("#color5").css("background-color");

    $(".level").css("background-color", color3);

    $(".triangle").each(function () {
        $(this).css("background-color", getTriangleColor());
    });

};


function getTriangleColor() {
    var base;
    if(Math.random() > 0.5) {
        base = $("#color1").css("background-color");
    } else {
        base = $("#color5").css("background-color");;
    }
    var t = tinycolor(base);
    var hsl = t.toHsl();
    
    hsl.s += Math.random()* 0.1-0.05;
    if(hsl.s < 0) hsl.s = 0;
    if(hsl.s > 1) hsl.s = 1;
    hsl.l += Math.random()* 0.1-0.05;
    if (hsl.l < 0) hsl.l = 0;
    if (hsl.l > 1) hsl.l = 1;
    
    return tinycolor(hsl).toHexString();
}

function loadHistory() {
    var html = '';
    $.each(levelMaker.getHistory(),function(key,value) {
        html += levelMaker.getHistoryEntryHtml(value);
    });
    $("#table-body").html(html);
}

var levelMaker = new LevelMaker();
setColors();
loadHistory();

$(".level").click(function() {
   exitRemoveMode();
});

$("#add-triangle").click(function() {
    exitRemoveMode();
    levelMaker.addTriangle();
});

$(".color-select").keyup(function() {
    setColors();
});

$("#get-string-btn").click(function() {
    console.log(levelMaker.getLevelJson());
});

$("#save-btn").click(function (e) {
    $('#save-modal').modal('show');
});

$("#save-form").submit(function(e) {

    e.preventDefault();

    var user = $("#creator-tag").val();
    var password = $("#password").val();
    var level_data = levelMaker.getLevelString();
    var level_name = $("#level-name").val();
    if(user!="" && password!="" && level_name!="") {

        levelMaker.saveLevel();

        $('#save-modal').modal('hide');
        $("#table-body").append(levelMaker.getHistoryEntryHtml(levelMaker.getLevelJson()));


        $.post("http://triangula.papaya-fiction.com/save.php", {
            user: user,
            password: password,
            level_name: level_name,
            level_data: level_data

        }).done(function(result) {

            if(result=='0') {
                alert('wrong username/password!')
            } else {
                alert('saved on server!')
            }

        });
    } else {
        alert("Please fill all fields!");
    }


});

$("#delete-history").click(function() {
    if(confirm("This deletes your whole level history. Are you sure?")) {
        levelMaker.deleteHistory();
    }
});

$("#load-string-btn").click(function() {
    var levelString = prompt("Paste your level string");
    levelMaker.loadLevelString(levelString);
});

$("body").on("click",".load-level-btn",function() {
    levelMaker.loadLevelString($(this).closest("tr").find(".level-string-input").val());
});

$("#widen-level").click(function() {
    $("#remove-item").removeClass("active");
    $(".level").css("width","+=500");
});

$("#shorten-level").click(function() {
    $("#remove-item").removeClass("active");
    $(".level").css("width","-=500");
});

$("#add-spikes").click(function() {
    exitRemoveMode();
});

$("#create-spikes-form").submit(function(e) {
    e.preventDefault();
    levelMaker.addSpike();
    $("#create-spikes-modal").modal("hide");

});

var doorCount = 0;

$("#add-door").click(function() {
    exitRemoveMode();
    levelMaker.addDoor();

});

$("#add-bomb").click(function() {
    exitRemoveMode();
    levelMaker.addBomb();
});

$("#add-exit").click(function() {
    exitRemoveMode();
    levelMaker.addExit();

});

$("#remove-item").click(function() {
    enterRemoveMode();
});


$("#load-json").click(function() {
    levelMaker.loadLevelString($("#load-json-input").val(), true);
});

$("#load-name").click(function() {
    levelMaker.loadLevelByName($("#load-name-input").val());
});







$(document).mousemove(function (e) {
    window.x = e.pageX;
    window.y = e.pageY;
});


//check whether shift key is pressed (snap-control)
$("body").keydown(function (e) {
    if(e.keyCode==16) {
        $(".triangle").each(function() {
            $(this).draggable({ snap: false });
        });

    } else if(e.keyCode == 27) {
        exitRemoveMode();
    }
});

$("body").keyup(function (e) {
    if(e.keyCode==16) {
        $(".triangle").each(function() {
            $(this).draggable({ snap: true });
        });
    }
});


//add items on key press
$("body").keypress(function (e) {



    var basePosition = $(".level").position();
    
    var posX = window.x - basePosition.left;
    var posY = window.y - basePosition.top;
    if(posX < 0 || posY < 0) {
        return;
    }

    switch (e.which) {
        case 116: // t for Triangle
            exitRemoveMode();
            var $triangle = $("<div class='triangle'></div>");
            $triangle.draggable().resizable({
                aspectRatio: 1
            }).rotatable();
            $triangle.css("background-color", getTriangleColor());
            $triangle.css({
                left: posX,
                top: posY
            });
            $triangle.appendTo($(".level"));

            $triangle.click(function() {
                removeItem($triangle);
            });


            break;
        case 98: // b for Bomb
            exitRemoveMode();

            var $bomb = $("<div class='bomb'></div>");
            $bomb.draggable();
            $bomb.css({
                left: posX,
                top: posY
            });
            $(".level").append($bomb);

            $bomb.click(function() {
                removeItem($bomb);
            });

            break;

        case 100:
            enterRemoveMode();
    }


});


function enterRemoveMode() {

    Triangula.removeMode = true;

    $("#remove-item").addClass("active");


    $(".triangle").each(function() {
        $(this).draggable({disabled:true});
    });

    $(".door-switch").each(function() {
        $(this).draggable({disabled:true});
    });

    $(".door").each(function() {
        $(this).draggable({disabled:true});
    });

    $(".spikes").each(function() {
        $(this).draggable({disabled:true});
    });

    $(".bomb").each(function() {
        $(this).draggable({disabled:true});
    });

    $(".exit").each(function() {
        $(this).draggable({disabled:true});
    });

}

function exitRemoveMode() {

    Triangula.removeMode = false;

    $("#remove-item").removeClass("active");


    $(".triangle").each(function() {
        $(this).draggable({disabled:false});
    });

    $(".door-switch").each(function() {
        $(this).draggable({disabled:false});
    });

    $(".door").each(function() {
        $(this).draggable({disabled:false});
    });

    $(".spikes").each(function() {
        $(this).draggable({disabled:false});
    });

    $(".bomb").each(function() {
        $(this).draggable({disabled:false});
    });

    $(".exit").each(function() {
        $(this).draggable({disabled:false});
    });

}



function removeItem(item) {

    if(Triangula.removeMode) {
        $(".level").find(item).remove();
        exitRemoveMode();
    }

}
