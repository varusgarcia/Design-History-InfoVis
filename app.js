d3.json("https://raw.githubusercontent.com/varusgarcia/Design-History-InfoVis/master/test-db/data.json", function (data){

  var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var startDate = 1850;
  var xScale = 30;
  var circleRadius = 60;
  var circleStrokeWidth = 3;

  var canvas = d3.select("body")
                .append("svg")
                .attr("id", "chartSVG")
                .attr("width", 5000)
                .attr("height", browserHeight)
                .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
                .append("g");

  // YEAR AXIS
  //Create the Scale we will use for the Axis
  var axisScale = d3.time.scale()
                    .domain([new Date(startDate, 0, 1), new Date(2016, 0, 1)])
                    .range([0,4920]);

  //Create the Axis
  var yearsAxis = d3.svg.axis()
                    .ticks(20)
                    .scale(axisScale);

  //Create a group Element for the Axis elements and call the xAxis function
  var yearsAxisGroup = canvas.append("g")
                    .attr('class', 'yearsAxis')
                    .attr("transform", "translate(40,"+(browserHeight-50)+")")
                    .call(yearsAxis);

  // Define the data for the node groups
  var nodeElements = canvas.selectAll("node")
                .data(data) // binds data to circles

  // Create and place the "blocks" containing the circle and the text
  var nodeBlock = nodeElements.enter()
                .append("g")
                .attr("id", function (d){ return d.ID})
                .attr("transform", function(d) { return "translate("+((d.Geboren * xScale) - (startDate * xScale))+","+(Math.random() * (browserHeight-40 - 30) + 30)+")";})

  // CIRCLE IMAGE
  var imgdefs = nodeBlock.append("defs").attr("id", "imgdefs")
  var nodeImage = imgdefs.append("pattern")
                        .attr("id", "nodeImage")
                        .attr("height", 1)
                        .attr("width", 1)
                        .attr("x", "0")
                        .attr("y", "0")

  nodeImage.append("image")
     .attr("x", 0)
     .attr("y", 0)
     .attr("height", circleRadius*2)
     .attr("width", circleRadius*2)
     .attr("xlink:href", "test-db/images/otl_aicher.png")

  // CIRLCES
  var circles = nodeBlock.append("circle")
                .attr("r", circleRadius)
                .attr("fill", "url(#nodeImage)")
                .attr("stroke", "#00729c")
                .attr("stroke-width", circleStrokeWidth)

  // TEXT BACKGROUND
  var labelsBackgroundMask = nodeBlock.append("clipPath")
                                        // make an id unique to this node
                                        .attr('id', "clipMask")
                                        // use the rectangle to specify the clip path itself
                                        .append('rect')
                                          .attr("x", -circleRadius)
                                          .attr("y", 10)
                                          .attr("width", circleRadius*2)
                                          .attr("height", circleRadius);

  var labelsBackground = nodeBlock.append("circle")
                                    .attr("clip-path", "url(#clipMask)")
                                    .attr("r", circleRadius)
                                    .attr("fill", "black")
                                    .attr("opacity", "0.8")

  // TEXT LABELS
  var labels = nodeBlock.append("text")
                .attr("dy", function(d){ return 30 })
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text(function(d){ return d.Name })

  // LINE CONNECTIONS
  d3.json("https://raw.githubusercontent.com/varusgarcia/Design-History-InfoVis/master/test-db/connection.json", function (connection){
    // draw lines between nodes based on connection ID's
    var line = canvas.selectAll("line")
                .data(connection)
                .enter()
                .insert("line", ":first-child")
                  .attr("x1", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID1)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y1", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID1)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr("x2", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID2)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y2", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID2)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr("stroke", "white")
                  .attr("stroke-width", function (d){ return d.Quality*2 }) // based on connection quality
                  .style("opacity", "0.2")
                  .on("mouseover", function(){ return d3.select(this).style("opacity", "1")})
                  .on("mouseout", function(){ return d3.select(this).style("opacity", "0.2")});
  })

  // HANDLE THE INFO POPOVERS AND DORPDOWNS
  var tooltip = d3.select("div.tooltip");
  var infoDropdown = d3.select("div.infoDropdown");

  d3.selectAll("g")
      .on("mouseover", function () {
          d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth+2)
          return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function () {
          //console.log(d3.event);
          return tooltip
              .style("top", (d3.event.pageY + 16) + "px")
              .style("left", (d3.event.pageX + 16) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth)
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function () {
        return infoDropdown.classed("hideInfoDropdown", false).classed("showInfoDropdown", true);
      });

  // hide the info dropdown
  d3.select(".hideButton").on("click", function () {
    return infoDropdown.classed("showInfoDropdown", false).classed("hideInfoDropdown", true);
  });

  // HANDLE ZOOM BEHAVIOR
  function zoom() {
    canvas.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
});
