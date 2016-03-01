/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The main entrance of the emotion visualization component.
 * This encloses some configuration and utility functions. 
 *  
 * @author Liang Gou, lgou@us.ibm.com
 * 
 */

emoViz = function() {
	var emoViz = {};

	emoViz.emotionCategories =["anger", "disgust", "sadness", "fear", "joy", "NA"];

	emoViz.emcolors = {joy: "rgb(250,219,77)", 
		trust: "rgb(153,204,51)", 
		fear: "rgb(53,164,80)",
		surprise: "rgb(63,165,192)", 
		sadness: "rgb(114,157,201)",
		disgust: "rgb(159,120,186)",
		anger: "rgb(228,48,84)",
		anticipation: "rgb(242,153,58)",
		NA: "#CCC"
	};

	emoViz.showTooltip = function(pos, content, dist) {
	 	dist = dist || [20,20];

   	 	var container = document.getElementById("tooltip");
   	 	
   	 	container.innerHTML = content;
   	 	container.style.visibility = "visible";
	    container.style.left = (pos[0] + dist[0]) + "px";
	    container.style.top = (pos[1] + dist[1]) + "px";
	};
	
	emoViz.hideTooltip = function() {
	    var container = document.getElementById("tooltip");
	    container.style.visibility = "hidden"; 
	};

	return emoViz;
}();
