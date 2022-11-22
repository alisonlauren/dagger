// popup.js to be used with popup.liquid
//
// IMPORTANT! READ!
// certain global variables like popupStartDateEnabled
// are set within popup.liquid, as shopify can't evaluate liquid in .js files
// if errors are thrown during evaluation, this may be due to errors in popup.liquid


/************************
*************************
	Cookie Functions
*************************
*************************/
    var docCookies = {
      getItem: function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
      },
      setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toUTCString();
              break;
          }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
      },
      removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
      },
      hasItem: function (sKey) {
        if (!sKey) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
      },
      keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
      }
    };
  
/*************************************************
**************************************************
Evaluate Start Date

returns true if Current Time is past start date
returns false if Current Date is before startDate
**************************************************
**************************************************/
    evaluateStartDate = function(){
        console.log('evaulating date');

        currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();

        var startYear = document.getElementById("promo-start-year").innerHTML;
        var startMonth = document.getElementById("promo-start-month").innerHTML - 1;
        var startDay = document.getElementById("promo-start-day").innerHTML;

        startDate = new Date( startYear, startMonth, startDay);

        console.log("the current date is " + currentTime);
        console.log("the promo starts " + startDate);

        //the plus implies milliseconds     
        if(+startDate < +currentTime){
            console.log('past start date');
            return true;
        }else{
            console.log('not past start date');
            return false;
        }
    }

/*************************************************
**************************************************
Evaluate Cookies
returns true if cookie was set
returns false if cookie already exists and hasn't expired
**************************************************
**************************************************/
    evaluateCookies = function(){
          cookie_name = 'popup-last-shown';
          cookie_end = cookie_days*24*60*60; //X days * 24 hours/day * 60 minutes/hour * 60 seconds/minute

          if( !docCookies.hasItem(cookie_name) ){		//if cookie does not exist
              console.log('customer hasnt seen popup, writing new cookie');
              docCookies.setItem( cookie_name, new Date(), cookie_end ); //show popup, make cookie with life of cookie_end
              return true;
          }
          else{ //if it does exist, it hasn't expired, so hide popup
            console.log('customer has seen popup, last at:'+docCookies.getItem(cookie_name));
            return false;
          }
    }
       
/************************
*************************
	Document Ready
*************************
*************************/
    
  console.log('popup-js');
  $(document).ready(function() {
    
      var id = '#dialog';
      if (sessionStorage.getItem('advertOnce') == 'true') {
          $('#boxes').css('display', 'initial');
          sessionStorage.setItem('advertOnce','true');
      }  
    
      //Window Resize
      resize = function(){
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
        $('#mask').css({
            'width': maskWidth,
            'height': maskHeight
        });
      }
      resize();
      window.onresize = resize;

   
      // Show or Hide Logic
      pastStartDate = true;
      cookieSet = true;
      if( popupStartDateEnabled ){
        pastStartDate = evaluateStartDate();
      }
      if( popupCookiesEnabled ){
        cookieSet = evaluateCookies();
      }
      if( !pastStartDate || !cookieSet ){
              $( "#boxes" ).hide();
      }else{
          document.getElementById("boxes").style.display = "initial";
          document.getElementById("dialog").style.display = "initial";
          //transition effect
          $('#mask').fadeIn(500);
          $('#mask').fadeTo("slow", 0.9);
          $(id).fadeIn(2000);
      }
    
      //Callbacks
      $('.window .close').click(function(e) {
          //Cancel the link behavior
          e.preventDefault();
          $('#mask').hide();
          $('.window').hide();
      });
      $('#mask').click(function() {
          $(this).hide();
          $('.window').hide();
      });
      $('input.checkboxz').change(function() {
        if ($(this).is(':checked')) {
          console.log('hello im on the console');
          $('input#mc-embedded-subscribe').css({"pointer-events": "initial", "background-color": "#932239"});
        } else {
          console.log('Unchecked');
          $('input#mc-embedded-subscribe').css({"pointer-events": "none", "background-color": "#B5B5B5"});
        }
      });  

      var winH = $(window).height();
      var winW = $(window).width();
  }); 


