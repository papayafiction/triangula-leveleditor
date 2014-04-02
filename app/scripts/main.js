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
    hsl.l += Math.random()* 0.1-0.05;
    return tinycolor(hsl).toHexString();
}

function loadHistory() {
    var html = '';
    $.each(levelMaker.getHistory(),function(key,value) {
        html += levelMaker.getHistoryEntryHtml(value);
    });
    $("#history-table").find("tbody").html(html);
}

var levelMaker = new LevelMaker();
setColors();
updateColorInformation();
loadHistory();

$("#add-triangle").click(function() {
    var $triangle = $("<div class='triangle'></div>");
    $triangle.draggable({ containment: "parent" }).resizable({
        aspectRatio: 1
    }).rotatable({
        autoHide: false
    });
    $triangle.css("background-color",getTriangleColor());
    $triangle.appendTo($(".level"));
});

$(".color-select").keyup(function() {
    updateColorInformation();
    setColors();
});

$("#get-string-btn").click(function() {
    console.log(levelMaker.getLevelJson());
});

$("#save-btn").click(function () {
    levelMaker.saveLevel();
    $("#history-table").find("tbody").append(levelMaker.getHistoryEntryHtml(levelMaker.getLevelJson()));
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
    $(".level").css("width","+=500");
});