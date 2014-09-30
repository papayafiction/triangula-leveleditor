//object to store variables
Triangula = {

    removeMode:false

};


function setColors() {
    var color1 = "#" + $("#color1").val();
    var color2 = "#" + $("#color2").val();
    var color3 = "#" + $("#color3").val();
    var color4 = "#" + $("#color4").val();
    var color5 = "#" + $("#color5").val();
    $(".level").css("background-color",color3);
}

function updateColorInformation() {
    for(var i=1;i<=5;++i) {
        $("#color-info" + i).css("background-color", "#" + $("#color" + i).val());
    }
    $(".triangle").each(function() {
        $(this).css("background-color",getTriangleColor());
    });
}

function getTriangleColor() {
    var base;
    if(Math.random() > 0.5) {
        base = "#" + $("#color1").val();
    } else {
        base = "#" + $("#color5").val();
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
updateColorInformation();
loadHistory();

$("#add-triangle").click(function() {
    exitRemoveMode();
    var $triangle = $("<div class='triangle'></div>");
    $triangle.draggable({snap: ".triangle"}).resizable({
        aspectRatio: 1
    }).rotatable();

    $triangle.css("background-color",getTriangleColor());
    $triangle.appendTo($(".level"));

    $triangle.click(function() {
        removeItem($triangle);
    });

});

$(".color-select").keyup(function() {
    updateColorInformation();
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


        $.post("save.php", {
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
    var triangle = "<div class='triangle'></div>";
    var amount = parseInt($("#spikes-count").val());
    var $spikes = $("<div class='spikes'></div>");
    $spikes.css("width",amount*100);
    
    var i = amount;
    while(i--) {
        var $triangle = $(triangle);
        $triangle.css('left',i*100);
        $spikes.append($triangle);
    }
    
    $(".level").append($spikes);
    $spikes.draggable().resizable({
        aspectRatio: amount,
        grid: [ amount, 1 ]
    }).rotatable();
    
    $spikes.resize(function() {
        var $triangles = $(this).find(".triangle");
        var triangle_size = $(this).width() / $triangles.length;
        $triangles.css({
            'width': triangle_size,
            'height': triangle_size
        });
        var i = $triangles.length;
        $triangles.each(function() {
            --i;
            $(this).css('left',i*triangle_size);
        });
    });
    
    $("#create-spikes-modal").modal("hide");

    $spikes.click(function() {
        removeItem($spikes);
    });

});

var doorCount = 0;

$("#add-door").click(function() {
    exitRemoveMode();
    var $switch = $("<div class='door-switch' id='door-switch-" + doorCount + "'>" + doorCount + "</div>");
    var $door = $("<div class='triangle door' id='door-" + doorCount + "'>" + doorCount + "</div>");
    $switch.draggable();
    $door.draggable().resizable({
        aspectRatio: 1
    }).rotatable();
    $(".level").append($switch);
    $(".level").append($door);
    doorCount++;

    $door.click(function() {
        removeItem($door);
        Triangula.removeMode=true;
        removeItem($switch);
    });
    $switch.click(function() {
        removeItem($door);
        Triangula.removeMode=true;
        removeItem($switch);
    });

});

$("#add-bomb").click(function() {
    exitRemoveMode();
    var $bomb = $("<div class='bomb'></div>");
    $bomb.draggable();
    $(".level").append($bomb);

    $bomb.click(function() {
        removeItem($bomb);
    });


});

$("#add-exit").click(function() {
    exitRemoveMode();
    var $exit = $("<div class='exit'></div>");
    $exit.draggable();
    $(".level").append($exit);


    $exit.click(function() {
        removeItem($exit);
    });

});

$("#remove-item").click(function() {
    enterRemoveMode();
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
            break;
        case 98: // b for Bomb
            var $bomb = $("<div class='bomb'></div>");
            $bomb.draggable();
            $bomb.css({
                left: posX,
                top: posY
            });
            $(".level").append($bomb);
            break;

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
