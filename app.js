d3.json("http://designgeschichte.fh-potsdam.de/nodes", function (data){

  var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var browserWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var startDate = 1870;
  var xScale = 30;
  var circleRadius = 60;
  var circleStrokeWidth = 3;

  // create an object
  var panExtent = {x: [new Date(startDate, 0, 1), new Date(2016, 0, 1)], y: [0,400] };

  // create the Scale we will use for the xAxis
  var yearsAxisScale = d3.time.scale()
                    .domain([new Date(startDate, 0, 1), new Date(2350, 0, 1)])
                    .range([0,browserWidth-80]);

  // create the Scale we will use for the yAxis
  var yAxisScale = d3.scale.linear()
                    .domain([0,200])
                    .range([browserHeight-130,0]);

  // create the xAxis
  var yearsAxis = d3.svg.axis()
                    .scale(yearsAxisScale)
                    .orient("bottom")
                    .ticks(10)
                    .tickSize(-browserHeight);

  // create the yAxis
  var yAxis = d3.svg.axis()
                    .scale(yAxisScale)
                    .orient("left")
                    .ticks(10);

  // look scaleExtent values ...
  // if base scale is max (10 -> last scaleExtent value), you cant zoom in, only zoom out
  // if base scale is min (1 -> first scaleExtent value), you cant zoom out, only zoom in
  // if base scale is in the middle (5), you can zoom in and zoom out
  var baseScale = 10;
  var zoom = d3.behavior.zoom()
      .x(yearsAxisScale)
      .y(yAxisScale)
      .scale(baseScale)
      .scaleExtent([1, 10])
      .on("zoom", zoomed);

  // CREATE THE SVG
  var svg = d3.select("body")
                .append("svg")
                .attr("id", "chartSVG")
                .attr("width", browserWidth)
                .attr("height", browserHeight)
                .append("g")
                .call(zoom);

                svg.append("rect")
                    .attr("width", browserWidth)
                    .attr("height", browserHeight);

  // create a group Element for the xAxis elements and call the xAxis function
  var yearsAxisGroup = svg.append("g")
                    .attr('class', 'yearsAxis')
                    .attr("transform", "translate(40,"+(browserHeight-50)+")")
                    .call(yearsAxis)
                    .selectAll("line")
                      .attr('class', 'tickLines');

  // NODE CIRCLES
  // Define the data for the node groups
  var contentGroup = svg.append("g")
                      .attr('class', 'contentGroup');

  var nodeElements = contentGroup.selectAll("node")
                          .data(data.nodes) // binds data to circles

  // Create and place the "blocks" containing the circle and the text
  var nodeBlock = nodeElements.enter()
                .append("g")
                .attr("id", function (d) { return 'node-' + d.id })
                .attr('class', 'nodes')
                .attr("transform", function(d) {

                  return "translate("+(((new Date(d.date_birth).getFullYear()) - startDate) * xScale + 50)+","+(Math.random() * (2*browserHeight-40 - 30) + 30)+")";
                });

  // CIRCLE IMAGE
  var imgdefs = nodeBlock.append("defs").attr("id", "imgdefs")
  var nodeImage = imgdefs.append("pattern")
                        .attr("id", function(d) { return "nodeImage" + d.id })
                        .attr("height", 1)
                        .attr("width", 1)
                        .attr("x", "0")
                        .attr("y", "0");

  nodeImage.append("image")
     .attr("x", 0)
     .attr("y", 0)
     .attr("height", circleRadius*2)
     .attr("width", circleRadius*2)
     .attr("preserveAspectRatio", "xMinYMin slice")
     .attr("xlink:href", function (d) { return d.image_src }); // well they all provided external links ... but thats not whats the field was for ... ^^

  // CIRLCES
  var circles = nodeBlock.append("circle")
                .attr("r", circleRadius)
                .attr("fill", function(d) {
                  if ( d.image_path == null) { return "#00506E"; }
                  else { return "url(#nodeImage" + d.id + ")"; }
                })
                .attr("stroke", "#00729c")
                .attr("stroke-width", circleStrokeWidth);

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
                                    .attr("opacity", "0.8");

  // TEXT LABELS
  var labels = nodeBlock.append("text")
                .attr("dy", function(d){ return 30 })
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text(function(d){ return d.surname });

  // LINE CONNECTIONS
  d3.json("http://designgeschichte.fh-potsdam.de/edges", function (connection) {

    var connections = {};

    // go trough connections and build new object, where the keys are the id of the node-element.
    // if a id is found in the object, increase by 1
    connection.edges.map(function(el, i) {
      if(connections[el.start_id]) {
        connections[el.start_id] = connections[el.start_id] + 1;
      } else {
        connections[el.start_id] = 1;
      }
      if(connections[el.node_id]) {
        connections[el.node_id] = connections[el.node_id] + 1;
      } else {
        connections[el.node_id] = 1;
      }
    });

    // select all nodes and scale them via connection count
    svg.selectAll('g.nodes').each(function(el, i) {
      // norm scale
      var scale = 1;

      // get the connection count, divide by 2 and multiply by 10
      if(connections[el.id] > 1) {
        scale = (connections[el.id] / 2) * 10;
      }

      // add multiplied scale to circle radius
      var circleRadius = 60 + scale;

      // add new circle radius
      d3.selectAll('#node-' + el.id + ' circle')
        .attr("r", circleRadius);

      // change rect width and height and x coordinate
      d3.select('#node-' + el.id + ' rect')
        .attr("x", -circleRadius)
        .attr("width", circleRadius * 2)
        .attr("height", circleRadius);

      // change image width and height
      d3.select('#node-' + el.id + ' image')
        .attr("width", circleRadius * 2)
        .attr("height", circleRadius * 2);

      // since the id name is all the same, we need to add a ID, so it wont load the first found image, with a false size
      // so we need to change the id via the index of the loop
      d3.select( d3.selectAll('#node-' + el.id + ' circle')[0].pop() )
        .attr("clip-path", "url(#clipMask-" + i + ")");

      d3.select( d3.selectAll('#node-' + el.id + ' circle')[0].shift() )
      .attr("fill", "url(#nodeImage-" + i + ")")

      d3.select('#node-' + el.id + ' clipPath')
          .attr('id', "clipMask-" + i)

      d3.select('#node-' + el.id + ' pattern')
        .attr("id", "nodeImage-" + i)

    });

    // draw lines between nodes based on connection ID's
    var line = contentGroup.selectAll("line:not(.tickLines)")
                .data(connection.edges)
                .enter()
                .insert("line", ":first-child")
                  .attr("x1", function (d){
                    var g = d3.select("svg").selectAll("#node-"+d.start_id)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y1", function (d){
                    var g = d3.select("svg").selectAll("#node-"+d.start_id)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr("x2", function (d){
                    var g = d3.select("svg").selectAll("#node-"+d.node_id)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y2", function (d){
                    var g = d3.select("svg").selectAll("#node-"+d.node_id)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr('class', 'connection')
                  .attr("stroke", "white")
                  .attr("stroke-width", function (d){ return d.type_id }) // based on connection quality
                  .style("opacity", "0.2");

    // HANDLE THE CONNECTION INFO POPOVER
    var connectionPopover = d3.select("div.connectionPopover");

    d3.selectAll("line.connection")
        .on("mouseover", function (d) {
            d3.select(this).style("opacity", "1")
            return connectionPopover.style("visibility", "visible").select(".role").html(d.title);
        })
        .on("mousemove", function () {
            return connectionPopover
                .style("top", (d3.event.pageY + 16) + "px")
                .style("left", (d3.event.pageX + 16) + "px");
        })
        .on("mouseout", function () {
          d3.select(this).style("opacity", "0.2")
          return connectionPopover.style("visibility", "hidden");
        })
        .on("click", function (d) {
          if (d3.event.defaultPrevented) return;
          return window.open(d.Quelle);
        });
  })

  // HANDLE THE INFO POPOVERS AND DORPDOWNS
  var tooltip = d3.select("div.tooltip");
  var infoDropdown = d3.select("div.infoDropdown");

  d3.selectAll("g.nodes")
      .on("mouseover", function (d) {
          tooltip.style("visibility", "visible")
          tooltip.select(".name").html(d.name + "&nbsp;" + d.surname)
          tooltip.select(".birthday").html("geb." + d.date_birth)
          tooltip.select(".day-of-death").html("gest. " + d.date_death)
          return d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth+2);
      })
      .on("mousemove", function () {
          return tooltip
              .style("top", (d3.event.pageY + 16) + "px")
              .style("left", (d3.event.pageX + 16) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth)
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function (d) {
        // applying all the data to the info dropdown
        infoDropdown.select(".image").attr("src", d.image_path)
        infoDropdown.select(".name").html(d.name + "&nbsp;" + d.surname)
        infoDropdown.select(".profession").html("Designer")
        infoDropdown.select(".birthday").html("* " + d.date_birth)
        infoDropdown.select(".birthplace").html("in " + d.Geburtsort)
        infoDropdown.select(".day-of-death").html("&dagger; " + d.date_death)
        infoDropdown.select(".place-of-death").html("in " + d.Todesort)

        infoDropdown.select(".vitaText").html(d.vita)

        if (d3.event.defaultPrevented) return;
        return infoDropdown.classed("hideInfoDropdown", false).classed("showInfoDropdown", true);
      });


  // hide the info dropdown
  d3.select(".hideButton").on("click", function () {
    return infoDropdown.classed("showInfoDropdown", false).classed("hideInfoDropdown", true);
  });

  // HANDLE ZOOM BEHAVIOR
  function zoomed() {

    // call the zoom.translate vector with the array returned from panLimit()
    // zoom.translate(panLimit());
    zoom.translate();

    svg.select(".yearsAxis").call(yearsAxis);
    svg.select(".yAxis").call(yAxis);

     svg.select('g.contentGroup').attr("transform", transform);
  }

  function transform(d) {
    var scale = d3.event.scale;
    var translate = d3.event.translate;

    scale = (scale / baseScale);

    /*
    console.log('1: ', translate);
    translate = translate.map(function(el, i) {
      return translate[i] * (scale / 1000);
    });
    console.log('2: ', translate);
    */

    var scaleText = "scale(" + scale + ")";
    return "translate(" + translate + ")" + " " + scaleText;
  }

  function panLimit() {
  	// include boolean to work out the panExtent and return to zoom.translate()
  	var divisor = {h: browserHeight / ((yAxisScale.domain()[1]-yAxisScale.domain()[0])*zoom.scale()), w: browserWidth / ((yearsAxisScale.domain()[1]-yearsAxisScale.domain()[0])*zoom.scale())},
  		minX = -(((yearsAxisScale.domain()[0]-yearsAxisScale.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(browserWidth/divisor.w)))),
  		minY = -(((yAxisScale.domain()[0]-yAxisScale.domain()[1])*zoom.scale())+(panExtent.y[1]-(panExtent.y[1]-(browserHeight*(zoom.scale())/divisor.h))))*divisor.h,
  		maxX = -(((yearsAxisScale.domain()[0]-yearsAxisScale.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
  		maxY = (((yAxisScale.domain()[0]-yAxisScale.domain()[1])*zoom.scale())+(panExtent.y[1]-panExtent.y[0]))*divisor.h*zoom.scale(),

  		tx = yearsAxisScale.domain()[0] < panExtent.x[0] ?
  				minX :
  				yearsAxisScale.domain()[1] > panExtent.x[1] ?
  					maxX :
  					zoom.translate()[0],
  		ty = yAxisScale.domain()[0]  < panExtent.y[0]?
  				minY :
  				yAxisScale.domain()[1] > panExtent.y[1] ?
  					maxY :
  					zoom.translate()[1];

  	return [tx,ty];
  }

});
