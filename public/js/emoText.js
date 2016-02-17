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
 * This module is used to render text.
 *
 * Author: Liang Gou, lgou@us.ibm.com
 * Date: July 20, 2015
 */

emoViz.emoText = function() {
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var textArray = [],
        emotionCategories // = ["anger", "disgust", "sadness", "fear", "none", "joy"]
        , dispatch = d3.dispatch('textMouseover', 'textMouseout'),
        animateDuration = 250,
        emotionData, wordToText;

    //============================================================
    // Main Implementation
    //------------------------------------------------------------

    function chart(selection) {
        selection.each(function(data) {

            var container = d3.select(this);

            container.selectAll(".list")
                .style("opacity", 1)
                .transition()
                .duration(animateDuration)
                .style("opacity", 0)
                .remove();

            var group = container.append("div")
                .attr("class", "list list-group")
                .attr("id", "text-list-group");
            var item = group.selectAll(".list .list-group-item")
                .data(data);
            // .data(addWordHighlightSpan(wordToText.keys(), data));

            var itemCtnt = item.enter().append("a")
                .attr("class", "list list-group-item")
                .attr("id", function(d, i) {
                    return "text_id_" + i;
                })
                .on("mouseover", function(d, i) {
                    dispatch.textMouseover({
                        data: d,
                        index: i,
                        pos: [d3.event.pageX, d3.event.pageY]
                    });
                })
                .on("mouseout", function(d, i) {
                    dispatch.textMouseout({
                        data: d,
                        index: i,
                        pos: [d3.event.pageX, d3.event.pageY]
                    });
                });
            itemCtnt.append("p")
                .html(function(d) {
                    return d;
                });

            //var emoBar = itemCtnt.append("div");

        });

        return chart;
    }

    //============================================================
    // Private functions
    //------------------------------------------------------------

    function addWordHighlightSpan(words, data) {

        return data.map(function(text) {

            var rslt = text;
            words.forEach(function(wd) {

                rslt = rslt.replace(new RegExp('\\b(' + wd + ')\\b', 'gi'), '<span class="matchedword" ' + '>$1</span>');

            });
            return rslt;
        });
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;

    chart.textArray = function(_) {
        if (!arguments.length) return textArray;
        textArray = _;
        return chart;
    };

    chart.emotionData = function(_) {
        if (!arguments.length) return emotionData;
        emotionData = _;
        return chart;
    };

    chart.wordToText = function(_) {
        if (!arguments.length) return wordToText;
        wordToText = _;
        return chart;
    };

    chart.animateDuration = function(_) {
        if (!arguments.length) return animateDuration;
        animateDuration = _;
        return chart;
    };

    chart.emotionCategories = function(_) {
        if (!arguments.length) return emotionCategories;
        emotionCategories = _;
        return chart;
    };

    return chart;

}
