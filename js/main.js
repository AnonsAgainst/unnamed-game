/*
 *  This file is part of The Unnamed Game.
 *
 *  The Unnamed Game is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The Unnamed Game is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with The Unnamed Game.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * See index.html for the rest of the JS files used, since
 * Javascript doesn't have "include" functionality built-in.
 */

/* array of button objects - the glue logic which maps the buttons to
   arbitrary functions.*/
var button = [];
function makeButtons() /* Called by main() right after setupScreen(). */
{
  for(var i=0; i <= 11; i++)
  {
    var j = i.toString(); /* have to do this to not have all the buttons point
                             to #11 */
    var tempButton = {
      num: parseInt(j),
      get element() { return document.getElementById("btn" + this.num)},
      set label(val) {
        this.element.innerHTML = val;
      },
      get label() {
        return this.element.innerHTML;
      },
      func: "",
      set visible(val) {
        if(val==false)
        {
          this.element.style["display"]="none";
        }
        else if(val==true)
        {
          this.element.style["display"]="inline";
        }
        else
        {
          console.log("Passing a non-true/false value to setVisible()! - Button number: " + this.num);
        }
      },
      set enabled(val) {
        if(val==true || val==false)
        {
          this.element.enabled=val;
        }
        else
        {
          console.log("Passing a non-true/false value to setEnabled()! - Button number: " + this.num);
        }
      },
      get enabled() {
        return (this.element.enabled);
      },
      get visible() {
        if(this.element.style["display"] == "none")
        {
          return false;
        }
        else
        {
          return true;
        }
      }
    }
      button[i] = tempButton;
  }

}



/*var button = []; *//* GLOBAL VARIABLE MUAHAHA. Contains button objects populated by setupScreen(). */
  /* populate button array with button objects */

function setupScreen()
{
  document.getElementById("settings").addEventListener("click", settingsMenu, false);
  document.getElementById("btnFullScreen").addEventListener("click", fullScreen, false);
  /* Clear screen of 'please enable javascript' text */
  write("");
  var saveSelBtn = document.getElementById("saveSelect");
  var saveOpt1 = document.createElement("option");
  var saveOpt2 = document.createElement("option");
  saveOpt1.value = "1";
  saveOpt1.text = "Slot 1";
  saveOpt2.value = "2";
  saveOpt2.text = "Slot 2";
  saveSelBtn.add(saveOpt1, null);
  saveSelBtn.add(saveOpt2, null);

}
/*  {
    element: document.getElementById("btn0"),
    label: "Button 0", // text on button
    func: "" // name of function to call, as a string. Yeah, if you're wondering, I'm using eval(). Muahaha.
  },
 }*/

/* Since I won't use JQuery (which uses '$()'), I can do this as shorthand to access output. */
function $()
{
  return document.getElementById("stdout");
}

/* erase all output and write a new page */
function write(str)
{
  $().innerHTML=str;
}

/* write to the output, preserving existing content. */
function append(str)
{
  $().innerHTML+=str;
}

/* append image with path str to output. Remember to use relative paths!*/
function appendImg(str)
{
  str="<img src=" + str + "></img>";
  $().innerHTML+=str;
}

function hideAllButtons()
{
  var i=0;
  while(i<11)
  {
    button[i].visible = false;
    i++;
  }
}

function updateStatusBars() /* refresh status bars with current values */
{
  statBarSet("#HPBar", player.stats.HpCurr );
  statBarSet("#StrBar", player.stats.str );
  statBarSet("#AccBar", player.stats.acc );
  statBarSet("#DefBar", player.stats.def );
  statBarSet("#IntBar", player.stats.int );
  statBarSet("#expBar", player.stats.exp );
  document.getElementById("levelField").innerHTML=player.stats.level;
  document.getElementById("moneyField").innerHTML=player.money;
}

function statBarSet(id, num) /* calculate stat bar widths and apply the results
                                to the status bar SVG's. */
{
  /* "ID" is the svg's ID (like IntBar or StrBar). num is the value to set.
   * HP and experience bars are not on a 0-100 scale like the others, so
   * they have special cases.
   * Once I actually have a playable game, I might make all stats have no static maximum.
   */

  /* first, update the bars' values themselves: */
  var selectorString= id + " .bar";
  if (id === "#HPBar")
  {
    document.querySelector(selectorString).setAttribute("width", ((parseFloat(num) / player.stats.HPMax) * 100).toString() + "%");

    /* then update numbers in bars: */
    selectorString += "Num"; /* barNum is the class for the numbers in the SVG's */
    document.querySelector(selectorString).innerHTML=(num + "/" + player.stats.HPMax);
  }
  else if (id === "#expBar")
  {
    var num1 = parseInt(( parseFloat(num) / (parseFloat(player.stats.XPToNextLevel)) * 100));
    document.querySelector(selectorString).setAttribute("width", num1.toString() + "%");

    /* then update numbers in bars: */
    selectorString += "Num"; /* barNum is the class for the numbers in the SVG's */
    document.querySelector(selectorString).innerHTML=(num + "/" + player.stats.XPToNextLevel);    
  }
  else
  {
    /* other stats are all out of 100 (as of now): */
    document.querySelector(selectorString).setAttribute("width", ((parseFloat(num) / 100) * 100).toString() + "%");
    /* then update numbers in bars: */
    selectorString += "Num"; /* barNum is the class for the numbers in the SVG's */
    document.querySelector(selectorString).innerHTML=num;
  }
}

function setMarginWidth(paddingWidth)
{ /* called from settings menu, adds padding to page for fullscreen on mobile devices. */
/*  var paddingWidth = document.getElementById("marginWidthSetting").value + "px";
  var container=document.getElementById("container");*/
  container.style["padding-left"]=paddingWidth;
  container.style["padding-right"]=paddingWidth;
}

function settingsMenu()
{
  /*
     Don't let this function execute when it's already in the settings menu.
     this will be important once we are backing up the current game state for
     restoration when exiting the settings menu.

     Procedure idea:
     0) disable save/load state buttons & 'settings; button to avoid some
        complications.
     1) get content of main game output [$().innerHTML] and save it to a
        variable.
     2) get functions associated with the bottom buttons (if I make the buttons
        be represented by objects in Javascript, this will be easy enough. If I
        use a string to represent the function name to call, this becomes even
        easier, but this approach requires buttons to run eval() when executed.
        I know eval() is controversial, but I _think_ this is a valid use case
        when you put religion aside.

        Button format:
        |--label
        |--call   :   function name associated with the button
        |--state  :   enabled/disabled
        |--vis    :   visibility ("display: none;" for instance)
  */

  hideAllButtons();
  document.getElementById("settings").removeEventListener("click", settingsMenu, false);
  write("\n<b>Page margins:</b>");
  /* slider */
  append('\n<div class="slidecontainer" style="display:inline;"><input type="range" min="0" max="75" value="0" class="slider" id="myRange" style="display:inline;"></div><div style="display: inline;" id="marginValue"></div>');
  append('\nSome devices (like phones) often have rounded corners on their screens which will be result in cropping the game when in full-screen. Use this to set margins past the beginning of the curve to avoid this.');
  var slider=document.getElementById("myRange");
  var sliderValueField=document.getElementById("marginValue");
  sliderValueField.innerHTML="<b>" + slider.value + "px</b>"
  slider.oninput = function() {
    var val = slider.value + "px"
    sliderValueField.innerHTML="<b>" + val + "</b>"
    setMarginWidth(val);

  }

}

function fullScreen()
{
  var pageElement = document.querySelector("body");
  /* both prefixed and un-prefixed versions of fullscreen API supported */
  if((!document.fullscreen) && (!document.mozFullScreen) && (!document.webkitIsFullScreen) && (!document.msFullscreenElement))
  {
    /* enable full screen. Try all the usual API's */
    /* un-prefixed */
    if(pageElement.requestFullscreen)
    {
      pageElement.requestFullscreen();
    }
    else if (pageElement.mozRequestFullScreen)
    {
      pageElement.mozRequestFullScreen();
    }
    else if (pageElement.webkitRequestFullScreen)
    {
      pageElement.webkitRequestFullScreen();
    }
    else if (pageElement.msRequestFullscreen)
    {
      pageElement.msRequestFullscreen();
    }
  }
  else /* if not already in full screen: */
  {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
  }
}


function mainMenu()
{
  write("<center><b>The Unnamed Game</b></center>");
  append('\nSource code is at: <a href="https://github.com/dragontamer8740/unnamed-game">https://github.com/dragontamer8740/unnamed-game</a>');
  append("\nHello world! This text was generated and placed by Javascript! :O ...well, it's a start, anyway. Now I technically have a backend and can write arbitrary text to the main output form. And look, it even wraps!\nNewlines work too!\n    And indentation as well!\n\n<div style='text-decoration: line-through; display: inline;'>Now if only I could find a nicer color scheme for legibility that wasn't black on white or white on black.</div> NEVER MIND, I found one, I think!\nAll of this output so far was printed with the write() function!");
  append("\nThis text was appended with a separate function intended for tacking on strings: append()!")
  append("\n\nTesting images:\n");
  appendImg("img/test.png");
  append("\n\nTesting some text effects!\n<b>BAM</b>\n<i>Pow!</i>\n<red>Zoom!</red> <blue>fizz!</blue>\n<yellow>Snap!</yellow> <orange>Crackle!</orange> <pink>Pop!</pink>(tm)\n<b><i><purple>SMAAAASH!</purple></i></b>\n<white>If you can read this, you don't need glasses.</white>");

  button[0].visible = true;
  button[0].label = "New Game";
}

function main()
{
  setupScreen();
  makeButtons();
  mainMenu();
  updateStatusBars();
}
