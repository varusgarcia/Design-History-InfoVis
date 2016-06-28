var apiUrl = 'http://designgeschichte.fh-potsdam.de/';
var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var browserWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var startDate = 1870;
var xScale = 30;
var baseCircleRadius = 10;
var circleStrokeWidth = 3;
var dateformat = d3.time.format("%d. %B %Y");
var dateOnlyYear = function(date) {
  var year = d3.time.format("%Y");
  date = new Date(date);
  if(date) {
    return year(date);
  }
  return 1337;
}


// -----------------------------------------------------------------------------
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
                  .tickSize(10); //originally "-browserHeight" to show lines inside the graph

// create the yAxis
var yAxis = d3.svg.axis()
                  .scale(yAxisScale)
                  .orient("left")
                  .ticks(10);


// -----------------------------------------------------------------------------
// IMPLEMENTING THE FORCE LAYOUT
var force = d3.layout.force()
          .charge(function (d) {return d.weight * -1000})
          .linkDistance(100)
          .size([browserHeight, browserWidth]);

// implementing the drag behavior for the nodes
var drag = d3.behavior.drag()
          .origin(function(d) { return d; })
          .on("dragstart", dragstarted)
          .on("drag", dragged)
          .on("dragend", dragended);

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


// -----------------------------------------------------------------------------
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


// -----------------------------------------------------------------------------
// the queue loads multiple JSON files at once
queue()
  .defer(d3.json, apiUrl + 'nodes')
  .defer(d3.json, apiUrl + 'edges')
  .defer(d3.json, apiUrl + 'edge/types')
  .await(makeLayout);

function makeLayout(error, nodesData, edgesData, edgeTypesData) {

  var edges = [];
  var nodes = nodesData.nodes;
  var types = edgeTypesData.types;

  // prepare edges
  edgesData.edges.forEach(function(e) {

      var sourceNode = nodes.filter(function(n) {
        return n.id === e.start_id;
      })[0];

      var targetNode = nodes.filter(function(n) {
        return n.id === e.node_id;
      })[0];

      var type = types.filter(function(n) {
        return n.id === e.type_id;
      })[0];

      // check if target node exists
      // edge could be not deleted, but the node could.
      if(sourceNode && targetNode) {
        edges.push({
            type: e.type_id,
            source: sourceNode,
            target: targetNode,
            /* debug
            id: e.id,
            start_id: e.start_id,
            node_id: e.node_id,
            */
            weight: type.weight, // connection weight
            edgeSource: e.edge_src
        });
      }
  });


  // ---------------------------------------------------------------------------
  // creating the scale for the x-Achsis
  var dom = [1850,2000];
  var xscale = d3.scale.linear().domain(dom).range([20,8000]);

  // binding the data to the force layout
  force.nodes(nodes)
      .links(edges)
      .start();

  // Define the data for the node groups
  var contentGroup = svg.append("g")
                      .attr('class', 'contentGroup');


  // ---------------------------------------------------------------------------
  // NODE EDGES/CONNECTIONS
  // draw lines between nodes based on connection ID's
  var link = contentGroup.append("g")
              .attr("class", "links")
              .selectAll("line:not(.tickLines)")
              .data(edges)
              .enter()
              .insert("line", ":first-child")
                .attr('class', 'connection')
                .attr("stroke", "white")
                .style("stroke-width", function(d) { return d.weight * 2; }) // set stroke-width based on connection type
                .style("opacity", "0.2");


  // ---------------------------------------------------------------------------
  // NODE CIRCLES
  // Create and place the "blocks" containing the circle and the text
  var nodeBlock = contentGroup.append("g")
                .attr("class", "nodes")
                .selectAll("node")
                .data(nodes)
                .enter()
                .append("g")
                  .attr("id", function (d) { return 'node-' + d.id })
                  .attr('class', 'node')
                  .attr("transform", function(d) {
                    return "translate("+((dateOnlyYear(d.date_birth) - startDate) * xScale + 50)+","+(Math.random() * (2*browserHeight-40 - 30) + 30)+")";
                  })
                  .call(drag);

  // CIRLCES
  var node = nodeBlock.append("circle")
                .attr("r", function(d) { return d.weight * 2 + baseCircleRadius; })
                .attr("fill", "#00506E")
                .attr("stroke", "#00729c")
                .attr("stroke-width", circleStrokeWidth);

  // TEXT LABELS
  var labels = nodeBlock.append("text")
                .attr("dy", function(d){ return d.weight * 2 + baseCircleRadius + 20 })
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text(function(d){ return d.surname });


  // ---------------------------------------------------------------------------
  // calling the force function to update the layout
  force.on("tick", function() {
    nodes.forEach (function(d,i) {
      //d.x = i * 15;
      d.x = xscale(dateOnlyYear(d.date_birth));
    })

    // update the connection lines
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // update the node circles
    nodeBlock.attr("transform", function(d,i) { return "translate(" + d.x + "," + d.y + ")"; });

    // hide loading indicator if everything is loaded
    d3.select('#loading-screen').style("display", "none");
  });

  var linkedByIndex = {};
  edges.forEach(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index];
  }


  // ---------------------------------------------------------------------------
  // handling the node+edge highlight for mouse events
  nodeBlock.on("mouseover", function(d){
      node.classed("node-active", function(o) {
          thisOpacity = isConnected(d, o) ? true : false;
          this.setAttribute('fill-opacity', thisOpacity);
          return thisOpacity;
      });

      link.classed("link-active", function(o) {
          return o.source === d || o.target === d ? true : false;
      });

      d3.select(this).classed("node-active", true);
      d3.select(this).select("circle").transition()
              .duration(50)
              .attr("r", (d.weight * 2 + baseCircleRadius)*1.2);
  });

  nodeBlock.on("mouseout", function(d){
      node.classed("node-active", false);
      link.classed("link-active", false);

      d3.select(this).select("circle").transition()
              .duration(200)
              .attr("r", d.weight * 2 + baseCircleRadius);
  });


  // ---------------------------------------------------------------------------
  // HANDLE THE CONNECTION INFO POPOVER
  var connectionPopover = d3.select("div.connectionPopover");

  d3.selectAll("line.connection")
      .on("mouseover", function (d) {
          d3.select(this).style("opacity", "1")
          var edgeType = edgeTypesData.types[d.type - 1];
          return connectionPopover.style("visibility", "visible").select(".head").html("<div class=\"role\">" + edgeType.title + "</div><div class=\"description\">" + edgeType.description + "</div>");
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
        return window.open(d.edgeSource);
      });


  // ---------------------------------------------------------------------------
  // HANDLE THE INFO POPOVERS AND DORPDOWNS
  var tooltip = d3.select("div.tooltip");
  var infoDropdown = d3.select("div.infoDropdown");

  d3.selectAll("g.node")
      .on("mouseover", function (d) {
          // show and fill the popover
          tooltip.style("visibility", "visible")
          tooltip.select(".image").attr("src", d.image_path)
          tooltip.select(".name").html(d.name + "&nbsp;" + d.surname)
          tooltip.select(".birthday").html(dateOnlyYear(d.date_birth))
          tooltip.select(".day-of-death").html(dateOnlyYear(d.date_death))

          // change attributes for connected lines to selected node
          link.style('stroke-width', function(l) {
            if (d === l.source || d === l.target)
              return 40;
            else
              return 2;
            });

          // change style for highlighted node
          return d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth+2);
      })
      .on("mousemove", function () {
          return tooltip
              .style("top", (d3.event.pageY + 16) + "px")
              .style("left", (d3.event.pageX + 16) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").attr("stroke-width", circleStrokeWidth)
        link.style("stroke-width", function(d) { return d.weight * 2; })
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function (d) {
        // applying all the data to the info dropdown
        infoDropdown.select(".image").attr("src", d.image_path)
        infoDropdown.select(".name").html(d.name + "&nbsp;" + d.surname)
        infoDropdown.select(".birthname").html(function() {
          if ( d.name_birth == 0) { return ""; }
          else {  return "geb. " + d.name_birth;  }
        })
        infoDropdown.select(".pseudonym").html(d.pseudonym)
        infoDropdown.select(".birthday").html("* " + dateformat(new Date(d.date_birth)))
        infoDropdown.select(".day-of-death").html("&dagger; " + dateformat(new Date(d.date_death)))
        infoDropdown.select(".source").html(d.source).attr("href", d.source)

        infoDropdown.select(".vitaText").html(d.vita_html)

        if (d3.event.defaultPrevented) return;
        return infoDropdown.classed("hideInfoDropdown", false).classed("showInfoDropdown", true);
      });


  // hide the info dropdown
  d3.select(".hideButton").on("click", function () {
    return infoDropdown.classed("showInfoDropdown", false).classed("hideInfoDropdown", true);
  });

} // closing the makeLayout queue


// -----------------------------------------------------------------------------
// HANDLE THE DRAG BEHAVIOR
function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();

  d3.select(this).classed("dragging", true);
  force.start();
}

function dragged(d) {

  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

}

function dragended(d) {

  d3.select(this).classed("dragging", false);
}


// -----------------------------------------------------------------------------
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
