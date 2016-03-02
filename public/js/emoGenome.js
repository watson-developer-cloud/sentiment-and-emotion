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
 * This is a visualization component, emoGenone, to show the mixture
 * emotions at one time with a stacked bar design.
 * Author: Liang Gou, lgou@us.ibm.com
 * Date: July 20, 2015
 */

emoViz.emoGenome = function (){
  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------
  var   x
      , y
      , yBand
      , bandHeight = 80
      , genomeWidth = 8
      , colorSchema
      , animateDuration = 250
      , emotionCategories //["anger", "disgust", "sadness", "fear", "none", "joy"]
      , dispatch = d3.dispatch('genomeMouseover', 'genomeMouseout','genomeBarMouseover', 'genomeBarMouseout')
      , barZoomHeightFactor = 2.2
      , barZoomWidthFactor = 3
      , slicedData
      ;

  //============================================================
  // Main Implementation
  //------------------------------------------------------------

  function chart(selection) {
    selection.each(function(data) {

      var container = d3.select(this);

      slicedData = transformData(data);

      var genomes = container.selectAll(".emogenome")
          .data(slicedData, function(d){
              return  d.index;
          });

      genomes.enter().append("g")
          .attr("class", "emogenome")
          .attr("id", function (d){ return "emogenome_index_"+d.index; })
          .attr("centerX", function(d){ return x(d.emotions[0].x);})
          .attr("centerY", function(d){ return y(d.emotions[0].sentiment);})
          .call(emoGenomeRender)
          .on("mouseover",function(d,i) {

            highlightGenome(d3.select(this));

            dispatch.genomeMouseover({
                  data: d,
                  pos: [d3.event.pageX, d3.event.pageY]
                });
          })
          .on("mouseout",function(d,i) {

            unhighlightGenome(d3.select(this));

            dispatch.genomeMouseout({
                  data: d,
                  pos: [d3.event.pageX, d3.event.pageY]
                });
          });


    });

    return chart;
  }

  //============================================================
  // Private functions
  //------------------------------------------------------------

  /**
   * Transform the stacked data results into the sliced data based
   * on x-axis
   * @param  {Array} data  stacked layer data from stack layout
   * @return {Array}           [description]
   */
  function transformData(data){
    var len = data[0].values.length;
    var sliced = [];

    for (i = 0; i < len; i++)
      sliced.push({"index": i,
           "date": null, //for future use
           "emotions": new Array(data.length)});

    data.forEach(function(layer, i){
      layer.values.forEach(function(d,j){
        sliced[j].date = d.date;
        sliced[j].emotions[i] = d;
      });
    });

    //set the dominant emotions
    sliced.forEach(function(ele){
      var max_score = d3.max(ele.emotions, function(d){return d.score;});
      ele.emotions.forEach(function(em){
        if (em.score === max_score) em.dominant = true;
        else em.dominant = false;
      });
    });

    return sliced;
  }

  function emoGenomeRender(selection){

    selection.each(function(data, timeIdx){

      var gEmoGenome = d3.select(this);

      //add x-axis navigation line
      var lastOne = data.emotions[0]
          ,lastOneBottom = y(lastOne.center)- barZoomHeightFactor * bandHeight/2 + barZoomHeightFactor * yBand(lastOne.y0 + lastOne.y) + barZoomHeightFactor * yBand(1-lastOne.y);

      gEmoGenome.append("rect")
          .attr("class", "emogenome-line")
          .attr("x", function(d){ return x(lastOne.x);})
          .attr("y", lastOneBottom)
          .attr("width", 2)
          .attr("height", y.range()[0] - lastOneBottom)
          .style("opacity", 0);

      //add y-axis navigation line
      var ynav = gEmoGenome.append("g")
          .attr("class", "emogenome-line")
          .style("opacity", 0);

          ynav.append("rect")
          .attr("x", function(d){ return 0;})
          .attr("y", function(d){ return  y(data.emotions[0].sentiment);})
          .attr("width", function(d){
              //return x.range()[1];
              var w = (x(data.emotions[0].x)- barZoomWidthFactor * genomeWidth/2);
              if(w < 0) w = 0;
              return  w;
           })
          .attr("height", 2);

          ynav.append("text")
          .attr("class", "navi-line-text")
          .attr("x", function(d){ return -26;})
          .attr("y", function(d){ return  y(data.emotions[0].sentiment);})
          .text((1.0 * data.emotions[0].sentiment).toPrecision(2));

      //add emotion genome bars
      var genomeBar = gEmoGenome.selectAll(".emogenome-bar")
          .data(data.emotions);

      var gbEnter=genomeBar.enter().append("rect")
          .attr("class", "emogenome-bar")
          .attr("x", function(d){ return x(d.x)-genomeWidth/2;})
          .attr("y", function(d){ return y(d.center)- bandHeight/2 + yBand(d.y0+ d.y);})
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("width", genomeWidth)
          .attr("height", function(d){ return yBand(1-d.y);})
          .style("fill", function(d) { return colorSchema[d.emotion]; })
          .style("stroke", function(d) { return colorSchema[d.emotion]; })
          .on("mouseover",function(d,i) {

              //only highlight selected one:
              gEmoGenome.selectAll(".emogenome-bar")
                  .filter(function(innerd){
                     return (innerd.emotion!==d.emotion);
                  })
                  .style("opacity", 0.5);

              dispatch.genomeBarMouseover({
                    data: d,
                    pos: [d3.event.pageX, d3.event.pageY]
                  });
          })
          .on("mouseout",function(d,i) {

              gEmoGenome.selectAll(".emogenome-bar")
                  .style("opacity", 1);

              dispatch.genomeBarMouseout({
                    data: d,
                    pos: [d3.event.pageX, d3.event.pageY]
                  });
          });


    });

  }

  function highlightGenome (sel){

     //show the x-axis navigation line
    sel.selectAll(".emogenome-line")
        .transition()
        .duration(animateDuration)
        .style("opacity", 0.75);

    //enlarge the bar
    sel.selectAll(".emogenome-bar")
        .each(function(d){
            d3.select(this)
              .transition()
              .duration(animateDuration)
              .attr("x", function(d){ return x(d.x)-barZoomWidthFactor * genomeWidth/2;})
              .attr("y", function(d){ return y(d.center)- barZoomHeightFactor * bandHeight/2 + barZoomHeightFactor * yBand(d.y0+ d.y);})
              .attr("width", barZoomWidthFactor * genomeWidth)
              .attr("height", function(d){ return barZoomHeightFactor * yBand(1-d.y);})
              .style("stroke", function(d) { return "#aaa"; });

        });
  }

  function unhighlightGenome (sel){
    //hide the x-axis navigation line
    sel.selectAll(".emogenome-line")
        .transition()
        .duration(animateDuration)
        .style("opacity", 0);

    //resize the bar back
    sel.selectAll(".emogenome-bar")
        .each(function(d){
            d3.select(this)
              .transition()
              .duration(animateDuration)
              .attr("x", function(d){ return x(d.x)-genomeWidth/2;})
              .attr("y", function(d){ return y(d.center)- bandHeight/2 + yBand(d.y0+ d.y);})
              .attr("width", genomeWidth)
              .attr("height", function(d){ return yBand(1-d.y);})
              .style("stroke", function(d) { return colorSchema[d.emotion]; });

        });
  }

  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.dispatch = dispatch;
  //chart.slicedData = slicedData;

  chart.highlightGenome = highlightGenome;
  chart.unhighlightGenome = unhighlightGenome;

  chart.slicedData = function(_) {
    if (!arguments.length) return slicedData;
    slicedData = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };

  chart.yBand = function(_) {
    if (!arguments.length) return yBand;
    yBand = _;
    return chart;
  };

  chart.bandHeight = function(_) {
    if (!arguments.length) return bandHeight;
    bandHeight = _;
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

  chart.genomeWidth = function(_) {
    if (!arguments.length) return genomeWidth;
    genomeWidth = _;
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
