/******************************************************************************
 * Copyright (c) 2005-2007 ognize.com and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Web:
 *     http://j2s.sourceforge.net/
 *     http://sourceforge.net/projects/j2s/
 * Contributors:
 *     ognize.com - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Jan 11, 2007
 *******/
 
/*
 * Update: March 5, 2007
 * ClassLoaderProgressMonitor were already in default j2slib.z.js.
 *
 * ClassLoaderProgressMonitor is optional. It's used to display class loading 
 * progress so that user know that background loading is still processing.
 *
 * Example:
<script type="text/javascript" 
	src="../net.sf.j2s.java.core/src/java/lang/ClassLoaderProgressMonitor.js">
</script>
<script>
...
ClazzLoader.scriptLoading = function (file) {
	ClassLoaderProgressMonitor.showStatus ("Loading " + file + "...");
};
ClazzLoader.scriptLoaded = function (file) {
	ClassLoaderProgressMonitor.showStatus (file + " loaded.", true);
};
ClazzLoader.loadClass ("com.example.Notepad", function () {
ClassLoaderProgressMonitor.showStatus("com.example.Notepad loaded.", true);
com.example.Notepad.main([]);
});
</script>
 */

ClazzLoaderProgressMonitor = ClassLoaderProgressMonitor = new Object ();
var clpm = ClassLoaderProgressMonitor;
clpm.fadeOutTimer = null;
clpm.fadeAlpha = 0;
clpm.monitorEl = null;
clpm.lastScrollTop = 0;
clpm.bindingParent = null;
clpm.DEFAULT_OPACITY = 55;
/* private static */ clpm.clearChildren = function (el) {
	if (el == null) return;
	for (var i = el.childNodes.length - 1; i >= 0; i--) {
		var child = el.childNodes[i];
		if (child == null) continue;
		if (child.childNodes != null && child.childNodes.length != 0) {
			this.clearChildren (child);
		}
		try {
			el.removeChild (child);
		} catch (e) {};
	}
};
/* private */ clpm.setAlpha = function (alpha) {
	if (this.fadeOutTimer != null && alpha == this.DEFAULT_OPACITY) {
		window.clearTimeout (this.fadeOutTimer);
		this.fadeOutTimer = null;
	}
	this.fadeAlpha = alpha;
	var ua = navigator.userAgent.toLowerCase ();
	if (ua.indexOf ("msie") != -1 && ua.indexOf ("opera") == -1) {
		this.monitorEl.style.filter = "Alpha(Opacity=" + alpha + ")";
	} else {
		this.monitorEl.style.opacity = alpha / 100.0;
	}
};
/* private */ clpm.createHandle = function () {
	var div = document.createElement ("DIV");
	div.style.cssText = "position:absolute;top:4px;left:4px;padding:2px 8px;"
			+ "z-index:3333;background-color:#8e0000;color:yellow;" 
			+ "font-family:Arial, sans-serif;white-space:nowrap;";
	div.onmouseover = function () {
		this.style.display = "none";
	};
	this.monitorEl = div;
	if (this.bindingParent == null) {
		document.body.appendChild (div);
	} else {
		this.bindingParent.appendChild (div);
	}
	return div;
};
/* private */ clpm.fadeOut = function () {
	if (this.monitorEl.style.display == "none") return;
	if (this.fadeAlpha == this.DEFAULT_OPACITY) {
		this.fadeOutTimer = window.setTimeout (function () {
					ClassLoaderProgressMonitor.fadeOut ();
				}, 750);
		this.fadeAlpha -= 5;
	} else if (this.fadeAlpha - 10 >= 0) {
		this.setAlpha (this.fadeAlpha - 10);
		this.fadeOutTimer = window.setTimeout (function () {
					ClassLoaderProgressMonitor.fadeOut ();
				}, 40);
	}
};
/* private */ clpm.getFixedOffsetTop = function (){
	if (this.bindingParent != null) {
		var b = this.bindingParent;
		return b.scrollTop;
	}
	var dua = navigator.userAgent;
	var b = document.body;
	var p = b.parentNode;
	var pcHeight = p.clientHeight;
	var bcScrollTop = b.scrollTop + b.offsetTop;
	var pcScrollTop = p.scrollTop + p.offsetTop;
	if (dua.indexOf("Opera") == -1 && document.all) {
		return (pcHeight == 0) ? bcScrollTop : pcScrollTop;
	} else if (dua.indexOf("Gecko") != -1) {
		return (pcHeight == p.offsetHeight 
				&& pcHeight == p.scrollHeight) ? bcScrollTop : pcScrollTop;
	}
	return bcScrollTop;
};
/* public */
clpm.initialize = function (parent) {
	this.bindingParent = parent;
};
/* public */
clpm.showStatus = function (msg, fading) {
	if (this.monitorEl == null) {
		this.createHandle ();
	}
	this.clearChildren (this.monitorEl);
	this.monitorEl.appendChild (document.createTextNode ("" + msg));
	if (this.monitorEl.style.display == "none") {
		this.monitorEl.style.display = "";
	}
	this.setAlpha (this.DEFAULT_OPACITY);
	var offTop = this.getFixedOffsetTop ();
	if (this.lastScrollTop != offTop) {
		this.lastScrollTop = offTop;
		this.monitorEl.style.top = (this.lastScrollTop + 4) + "px";
	}
	if (fading) {
		this.fadeOut();
	}
};
if (window["ClazzLoader"] != null) {
	ClazzLoader.scriptLoading = function (file) {
		ClassLoaderProgressMonitor.showStatus ("Loading " + file + "...");
	};
	ClazzLoader.scriptLoaded = function (file) {
		ClassLoaderProgressMonitor.showStatus (file + " loaded.", true);
	};
	ClazzLoader.globalLoaded = function (file) {
		ClassLoaderProgressMonitor.showStatus ("Application loaded.", true);
	};
	var ua = navigator.userAgent.toLowerCase ();
	if (ua.indexOf ("msie") != -1 && ua.indexOf ("opera") == -1) {
		ClazzLoader.setLoadingMode ("script", 5);
	}
}