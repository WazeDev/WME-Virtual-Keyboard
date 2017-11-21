// ==UserScript==
// @name         WME Virtual Keyboard
// @namespace    http://tampermonkey.net/
// @version      2017.11.20.001
// @description  Adds a "virtual keyboard" to type locale-specific characters (currently only Turkish characters).
// @author       MapOMatic
// @include     /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hidePopup($popup, $parentMenu) {
        var timeoutId = setTimeout(function() {
            $popup.css({display:'none'});
            $parentMenu.css({'border-radius':'8px 8px 8px 8px', 'background-color':'#999', 'box-shadow':''});
        }, 100);
        $popup.data('timeoutId', timeoutId);
    }

    function showPopup($popup, $parentMenu) {
        $popup.css({display:'inherit'});
        $parentMenu.css({'border-radius':'8px 8px 0px 0px', 'background-color':'#777', 'box-shadow':'#b2b2b2 2px 2px 8px'});
        clearTimeout($popup.data('timeoutId'));
    }

    function buttonOnMouseDown(evt) {
        evt.preventDefault();
        var char = $(evt.target).text();
        var element = document.activeElement;
        var $element = $(element);
        if (element && ($element.is('input:text') || $element.is('textarea'))) {
            var text = $element.val();
            var start = element.selectionStart;
            var end = element.selectionEnd;
            text = text.slice(0,start) + char + text.slice(end);
            $element.val(text);
            element.selectionStart = start+1;
            element.selectionEnd = start+1;
            $element.change();
        }
    }

    function init() {
        console.log('WME More Letters: Initializing...');

        var $menuParentDiv = $('#advanced-tools');

        var $menuDiv = $('<div>', {id:'more-letters-menu'})
        .css({width:'56px', height:'18px', left:'10px', top:'27px', 'background-color': '#999', 'padding-top':'1px',
              'z-index':'2000', 'margin-top':'-12px', 'margin-bottom':'2px', cursor:'default', 'font-size':'12px',
              'text-align':'center', color:'white', 'border-radius':'8px 8px 8px 8px'})
        .text('Turkish')
        .appendTo($menuParentDiv);

        var offset = $menuDiv.position();

        var $popupDiv = $('<div>', {id:'more-letters-popup'})
        .css({padding:'2px', left:offset.left, top:offset.top + $menuDiv.height(), 'background-color': '#f8f8f8',
              'box-shadow':'#b2b2b2 2px 2px 8px', 'z-index':'2001', 'margin-top':'-11px', cursor:'default', 'font-size':'13px',
              'text-align':'center', color:'black', display:'none', position:'absolute'})
        .appendTo($menuParentDiv);

        var chars = [['Ç','ç'],['Ğ','ğ'],['I','ı'],['İ','i'],['Ö','ö'],['Ş','ş'],['Ü','ü']];
        var $table = $('<table>');
        var buttonStyle = {width:'22px',height:'22px',padding:'unset'};
        var tdStyle = {padding:'4px 4px'};
        chars.forEach(function(pair) {
            $table.append($('<tr>').append(
                $('<td>').css(tdStyle).append($('<button>', {class:'waze-btn waze-btn-white'}).text(pair[0]).css(buttonStyle).mousedown(buttonOnMouseDown)),
                $('<td>').css(tdStyle).append($('<button>', {class:'waze-btn waze-btn-white'}).text(pair[1]).css(buttonStyle).mousedown(buttonOnMouseDown))
            ));
        });
        $popupDiv.append($table);

        $menuDiv.mousedown(function(evt) {
            evt.preventDefault();
            showPopup($popupDiv, $menuDiv);
            clearTimeout($menuDiv.data('timeoutId'));
        }).mouseenter(function() {
            var timeoutId = setTimeout(function() {
                showPopup($popupDiv, $menuDiv);
            }, 100);
            $menuDiv.data('timeoutId', timeoutId);
        }).mouseleave(function() {
            hidePopup($popupDiv, $menuDiv);
            clearTimeout($menuDiv.data('timeoutId'));
        });

        $popupDiv.mouseleave(function() {
            hidePopup($popupDiv, $menuDiv);
        }).mouseenter(function() {
            showPopup($popupDiv, $menuDiv);
        }).mousedown(function(evt) {
            evt.preventDefault();
        });
    }

    function bootstrap(retries) {
        retries = retries || 0;
        if (retries === 100) {
            console.log('WME More Letters: Initialization failed.  Exiting script.');
            return;
        }
        if (window.require && W && W.loginManager &&
            W.map && W.loginManager.isLoggedIn() && $('#advanced-tools').length) {
            init();
        } else {
            retries += 1;
            setTimeout(function () {
                bootstrap(retries);
            }, 250);
        }
    }

    bootstrap();
})();
