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
 * This is a timeline-based visualization to reveal the changes
 * of emotion over the time or sequentially.
 * Author: Liang Gou, lgou@us.ibm.com
 * Date: July 20, 2015
 */

emoViz.emoTimeline = function() {
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 20
        },
        width = 960,
        height = 150,
        animateDuration = 250,
        colorSchema = d3.scale.category20(),
        bandHeight = 60,
        emotionCategories //= ["anger", "disgust", "sadness", "fear", "none", "joy"]
        , dispatch = d3.dispatch('areaMouseover', 'areaMouseout', 'genomeMouseover', 'genomeMouseout', 'genomeBarMouseover', 'genomeBarMouseout'),
        emoGenome, startLineIndex = 1;
    var maxOpacity = 0.85,
        minOpacity = 0.2;
    //============================================================
    // Main Implementation
    //------------------------------------------------------------

    function chart(selection) {
        selection.each(function(data) {

            var container = d3.select(this);

            //TODO: use the d3 data update mechanism to re-draw the viz.
            container.selectAll("g")
                .style("opacity", 1)
                .transition()
                .duration(animateDuration)
                .style("opacity", 0)
                .remove();

            var wraper = container.append("g")
                .attr("class", "emviz-wrapper")
                .attr("transform", "translate(" + margin.left + " " + margin.top + ")");

            var gEmoTimeline = wraper.append("g")
                .attr("class", "emviz-emotimeline");

            var x = d3.scale.linear()
                .domain([0, data.length - 1])
                .range([0, width - margin.left - margin.right]);

            var y = d3.scale.linear()
                .domain([-1.2, 1.2])
                .range([height - margin.top - margin.bottom, 0]);

            var yBand = d3.scale.linear()
                .domain([0, 1])
                .range([bandHeight, 0]);

            var area = d3.svg.area().interpolate("monotone")
                .x(function(d) {
                    return x(d.x);
                })
                .y0(function(d) {
                    return y(d.center) - bandHeight / 2 + yBand(d.y0);
                })
                .y1(function(d) {
                    return y(d.center) - bandHeight / 2 + yBand(d.y0 + d.y);
                });

            var zeroArea = d3.svg.area()
                .x(function(d) {
                    return x(d.x);
                })
                .y0(function(d) {
                    return y(d.center) - bandHeight / 2 + yBand(d.y0);
                })
                .y1(function(d) {
                    return y(d.center) - bandHeight / 2 + yBand(d.y0);
                });

            var stack = d3.layout.stack()
                .values(function(d) {
                    return d.values;
                });


            //transform data:
            data = transformData(data, emotionCategories);
            //calculate the layout of the stacked layers from the data
            var stackdata = stack(data);

            //-------------------------------------------------------
            //add axis and labels
            //-------------------------------------------------------
            addAxis(gEmoTimeline, x, y);


            //-------------------------------------------------------
            //Main part. add emotion bands visualization
            //-------------------------------------------------------

            var emoBand = gEmoTimeline.append("g")
                .attr("class", "emobands")
                .selectAll(".emoband")
                .data(stackdata, function(d) {
                    return d.name;
                });

            emoBand.enter().append("path")
                .attr("class", function(d) {
                    return "emoband emoband-" + d.name;
                })
                //.attr("d", function(d) { return area(d.values); })
                .style("fill", function(d) {
                    return colorSchema[d.name];
                })
                .style("stroke", function(d) {
                    return colorSchema[d.name];
                })
                .on('mouseover', function(d, i) {
                    container.selectAll(".emoband")
                        .filter(function() {
                            return !d3.select(this).classed("emoband-" + d.name);
                        })
                        .each(function(d) {
                            d3.select(this).transition().duration(animateDuration)
                                .style("opacity", minOpacity);
                        });
                    //.classed('emoband-unhighlighted', true);
                    dispatch.areaMouseover({
                        data: d,
                        name: d.name,
                        pos: [d3.event.pageX, d3.event.pageY],
                        seriesIndex: i
                    });
                })
                .on('mouseout', function(d, i) {
                    container.selectAll(".emoband")
                        .each(function(d) {
                            d3.select(this).transition().duration(animateDuration)
                                .style("opacity", maxOpacity);
                        });
                    //.classed('emoband-unhighlighted', false);
                    dispatch.areaMouseout({
                        data: d,
                        name: d.name,
                        pos: [d3.event.pageX, d3.event.pageY],
                        seriesIndex: i
                    });
                });

            //data update/remove:
            emoBand.exit()
                .attr('d', function(d, i) {
                    return zeroArea(d.values, i);
                })
                .remove();

            emoBand
                .attr('d', function(d, i) {
                    return area(d.values, i);
                });

            //-------------------------------------------------------
            //add emotion genome viz to show emotions at a time point.
            // (We can do the same thing with a scatter plot like viz by
            // calling emoViz.emoScatter().)
            //------------------------------------------------------
            emoGenome = emoViz.emoGenome()
                .x(x)
                .y(y)
                .yBand(yBand)
                .bandHeight(bandHeight)
                .emotionCategories(emotionCategories)
                .colorSchema(colorSchema);

            wraper.append("g")
                .attr("class", "emviz-emogenome")
                .datum(stackdata)
                .call(emoGenome);

            //event listeners for emotion genome
            emoGenome.dispatch.on("genomeMouseover", function(d) {
                gEmoTimeline.select(".emobands")
                    .style("opacity", 1)
                    .transition()
                    .duration(animateDuration)
                    .style("opacity", 0.25);
                //relay the event to the parent object:
                dispatch.genomeMouseover(d);

            });

            emoGenome.dispatch.on("genomeMouseout", function(d) {
                gEmoTimeline.select(".emobands")
                    .transition()
                    .duration(animateDuration)
                    .style("opacity", 1);
                //relay the event to the parent object:
                dispatch.genomeMouseout(d);

            });

            emoGenome.dispatch.on("genomeBarMouseover", function(d) {
                //get the sliced data for the current genome
                var pdata = emoGenome.slicedData()[d.data.index];

                //show the popup of the emotion scores at this time:
                var content = '<table class="table">';

                for (var i = pdata.emotions.length - 1; i >= 0; i--) {
                    var emo = pdata.emotions[i];
                    var styleClass = (emo.emotion === d.data.emotion) ? "popup-table-row popup-table-row-highlighted" : "popup-table-row";
                    if (emo.dominant) styleClass += " popup-table-dominant";
                    content += '<tr class ="' + styleClass + '" id="table_row_' + emo.emotion + '">';
                    content += '<td style = " color: ' + colorSchema[emo.emotion] + '">' + emo.emotion + '</td>';
                    content += '<td>' + Number(emo.score).toFixed(2) + '</td>';
                    content += '</tr>';
                }

                emoViz.showTooltip(d.pos, content, [30, -80]);

                //relay the event to the parent object:
                dispatch.genomeBarMouseover(d);
            });

            emoGenome.dispatch.on("genomeBarMouseout", function(d) {
                emoViz.hideTooltip(d.pos);
                //relay the event to the parent object:
                dispatch.genomeBarMouseout(d);
            });

            //-------------------------------------------------------
            //add legend and control
            //-------------------------------------------------------
            addLegend(container);

        });

        return chart;
    }

    //============================================================
    // Private functions
    //------------------------------------------------------------

    /**
     * Transform the emotion API results into the format which the viz
     * can consume
     * @param  {Array} emo_data  [description]
     * @param  {Array} emo_cates [description]
     * @return {Array}           [description]
     */
    function transformData(emo_data, emo_cates) {
        var _sentiLbl = "sentimentAnalysis",
            _sentiment = "score",
            _emotions = "emotionAnalysis";

        //add index for the data
        emo_data.forEach(function(d, i) {
            //d.date = parseDate(d.date);
            d.x = i;
        });

        return emo_cates.map(function(name) {
            return {
                name: name,
                values: emo_data.map(function(d, i) {
                    return {
                        emotion: name,
                        date: d.date,
                        index: d.x,
                        score: (d[_emotions]) ? d[_emotions][name] : 0,
                        sentiment: d[_sentiLbl][_sentiment],
                        x: d.x,
                        y: d[_emotions][name] / 1.0,
                        center: d[_sentiLbl][_sentiment] / 1.0
                    };
                })
            };
        });
    }


    /**
     * add axis and labels. @TODO: re-factor it to a component
     * @param {[type]} container [description]
     * @param {[type]} x         [description]
     * @param {[type]} y         [description]
     */
    function addAxis(container, x, y) {

        var container = container.append("g")
            .attr("class", "emotimeline-axis");

        var formatPercent = d3.format(".0%");

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(x.domain()[1])
            .orient("bottom")
            .tickFormat(function(d) {
                return "text " + (d + startLineIndex);
            });

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(function(d) {
                // var ticklbl = Math.round((d-0.5)*10);
                // if ( ticklbl === 5 || ticklbl === -5 ) ticklbl ="";
                // var ticklbl = Math.round(d*10);
                // if ( ticklbl === 10) ticklbl ="";
                return d;
            });

        var gridYAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickSize(-width, 0, 0)
            .tickFormat("");

        var gxAxis = container.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xAxis);

        var gyAxis = container.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        container.append("g")
            .attr("class", "y grid")
            .attr("stroke-dasharray", "10,10")
            .call(gridYAxis);

        gyAxis.append("text")
            .attr("class", "y axislabel")
            .attr("x", 4)
            .attr("y", 10)
            .text("Positive");

        gyAxis.append("text")
            .attr("class", "y axislabel")
            .attr("x", 4)
            .attr("y", height - margin.top - margin.bottom - 10)
            .text("Negative");
    }

    /**
     * add legend to control the viz. @TODO: re-factor it to a component
     * @param {[type]} container [description]
     * @param {[type]} data      [description]
     */
    function addLegend(container) {
        var space = 90;
        var lgd = container.append("g")
            .attr("class", "emotimeline-legend")
            .attr("transform", "translate(" + (width - margin.left - margin.right - 1.2 * Math.floor(emotionCategories.length / 2) * space) + ", " + (margin.top * 0.3) + ")");
        var lgdele = lgd.selectAll(".legend-ele")
            .data(emotionCategories).enter()
            .append("g")
            .attr("class", "legend-ele");

        lgdele.append("circle")
            .attr("class", "legend-circle")
            .attr("cx", function(d, i) {
                return Math.floor(i / 2) * space + 7;
            })
            .attr("cy", function(d, i) {
                return i % 2 === 0 ? 8 : 24;
            })
            .attr("r", 5)
            .attr("stroke", function(d) {
                return colorSchema[d];
            })
            .attr("fill", function(d) {
                return colorSchema[d];
            })
            .attr("fill-opacity", 0.9)
            .style("cursor", "hand")
            .on("click", function(d) {
                var p = d3.select(this).attr("fill-opacity");
                d3.select(this).attr("fill-opacity", p).transition().duration(animateDuration).attr("fill-opacity", 1 - p);

                //update the emotion band with the control:
                container.selectAll(".emoband-" + d)
                    .each(function(d) {
                        d3.select(this).style("opacity", p).transition().duration(animateDuration)
                            .style("opacity", maxOpacity - p)
                            .each("end", function(d) {
                                d3.select(this).style("visibility", function() {
                                    return (maxOpacity - p) > 0.1 ? "visible" : "hidden";
                                })
                            });
                    });

            });

        lgdele.append("text")
            .attr("x", function(d, i) {
                return Math.floor(i / 2) * space + 15;
            })
            .attr("y", function(d, i) {
                return i % 2 === 0 ? 12 : 28;
            })
            .attr("fill", function(d) {
                return colorSchema[d];
            })
            .text(function(d) {
                return d;
            });

    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.emoGenome = function() {
        return emoGenome;
    };

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
        return chart;
    };

    chart.blockblockPadding = function(_) {
        if (!arguments.length) return blockblockPadding;
        blockblockPadding = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.animateDuration = function(_) {
        if (!arguments.length) return animateDuration;
        animateDuration = _;
        return chart;
    };

    chart.colorSchema = function(_) {
        if (!arguments.length) return colorSchema;
        colorSchema = _;
        return chart;
    };

    chart.id = function(_) {
        if (!arguments.length) return id;
        id = _;
        return chart;
    };

    chart.bandHeight = function(_) {
        if (!arguments.length) return bandHeight;
        bandHeight = _;
        return chart;
    };

    chart.emotionCategories = function(_) {
        if (!arguments.length) return emotionCategories;
        emotionCategories = _;
        return chart;
    };

    chart.startLineIndex = function(_) {
        if (!arguments.length) return startLineIndex;
        startLineIndex = _;
        return chart;
    };


    return chart;
}
