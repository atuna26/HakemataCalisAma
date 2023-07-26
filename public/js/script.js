
currentDateText= document.querySelector(".barColor")
currentDate = new Date();
const formattedDate = currentDate.toLocaleString('default', {day:'2-digit',month:"2-digit",year:'numeric' }).replace(/\//g, '.');
options = document.querySelector(".options")


$(selector).hover(function () {
    // over
    
  }, function () {
    // out
  }
);

const dateParts = formattedDate.split('.');
const dd_mm_yyyy = `${dateParts[1]}.${dateParts[0]}.${dateParts[2]}`;

currentDateText.innerText = dd_mm_yyyy;

function leagueBack(){
  window.location.href="/ayarlar/league"
}

function refereeChanged() {
  window.location.href="/ayarlar/referee/"+document.getElementById('refereeSelect').value
}
function teamChanged() {
    window.location.href="/ayarlar/team/"+document.getElementById('teamSelect').value
}
function leagueChanged(){
    window.location.href="/ayarlar/league/"+document.getElementById("leagueSelect").value
}

function toggleTable(){
  $(".refereeFixture").toggle();
}

jQuery.expr[':'].icontains = function (a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};


    /* ARAMA KISMI */
$(document).ready(function () {
  $('.table-search').keyup(function () {
      var data = this.value.split(" ");
      var table = $(".uk-table").find("tr")


      if (this.value == "") {
          table.show();
          return;
      }
      table.hide();
      table.filter(function (i, v) {
          var $t = $(this);
          if ($t.parents('thead').length > 0) {
              return true; // Do not filter printable or thead elements
          }
          for (var d = 0; d < data.length; ++d) {
              if ($t.is(":icontains('" + data[d] + "')")) {
                  return true;
              }
          }
          return false;
      }).show();
  });
});

/* Yükleme Ekranı */

document.onreadystatechange = function(){
  if (document.readyState !== "complete"){
    $("body").hide();
    $(".loader").show();
  } else{
    $("body").show();
    $(".loader").fadeOut();

  }
}

/*
function addOption() {
    var options = document.querySelector('.options');
    var newOption = options.cloneNode(true);
    options.parentNode.appendChild(newOption, options.nextSibling);
}
function addOptionGroup() {
  var optionsGroup = document.querySelector('.optionsGroup');
  var newOptionGroup = optionsGroup.cloneNode(true);
  optionsGroup.parentNode.appendChild(newOptionGroup, optionsGroup.nextSibling);
}

function addOptionLeague() {
    var optionRefereeLeague = document.querySelector('.allOptions');
    var newOptionRefereeLeague = optionRefereeLeague.cloneNode(true);
    optionRefereeLeague.parentNode.appendChild(newOptionRefereeLeague, optionRefereeLeague.nextSibling);
}
*//* 
function groupCreate() {
    var numGroups = document.getElementsByName("numberGroup")[0].value;
    var gruplarDiv = document.getElementById("gruplar");
    gruplarDiv.innerHTML = "";
    for (var i = 1; i <= numGroups; i++) {
      var grupDiv = document.createElement("div");
      grupDiv.style.width="150px"
      grupDiv.style.display = "inline-block";
      grupDiv.style.border = "1px solid black";
      grupDiv.style.padding = "10px";
      grupDiv.innerHTML = "<h2>Grup " + i + "</h2>";
  
      var selectDiv = document.createElement("div");
      var select = document.createElement("select");
      select.name = "grup" + i + "_select";
      selectDiv.appendChild(select);
  
      var addButton = document.createElement("button");
      addButton.innerHTML = "+";
      addButton.type = "button";
      addButton.onclick = (function(grup, select) {
        return function() {
          var option = document.createElement("option");
          option.text = "Option";
          option.value = "value" + select.options.length;
          select.add(option);
  
          var selectedOptionValue = select.options[select.selectedIndex].value;
          var selectedOptionDiv = document.createElement("div");
          selectedOptionDiv.innerHTML = "Seçili option: " + selectedOptionValue;
          grup.appendChild(selectedOptionDiv);
        }
      })(grupDiv, select);
      selectDiv.appendChild(addButton);
  
      grupDiv.appendChild(selectDiv);
      gruplarDiv.appendChild(grupDiv);
    }
  } */
